import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly apiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Default to Ollama endpoint if not configured
    this.apiUrl = this.configService.get<string>(
      'LLM_API_URL',
      'http://localhost:11434/v1/chat/completions',
    );
    this.model = this.configService.get<string>('LLM_MODEL', 'llama3.2');
    this.timeoutMs =
      Number(this.configService.get('LLM_TIMEOUT_MS')) || 30000;
    this.apiKey = this.configService.get<string>('LLM_API_KEY');
  }

  async generateBingoOptions(roomTitle: string): Promise<string[]> {
    const systemPrompt = `You are a creative bingo option generator. Generate exactly 24 unique, fun, and relevant bingo options based on the theme provided. Each option should be:
- Concise (under 50 characters)
- Specific and observable (something that can clearly happen or be said)
- Appropriate for a family game night
- Varied in likelihood (some common, some rare)

Return ONLY a JSON array of 24 strings, nothing else. Example format:
["Option 1", "Option 2", ...]`;

    const userPrompt = `Generate 24 bingo options for a game themed: "${roomTitle}"`;

    const messages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key if configured (for OpenAI, Azure, etc.)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      this.logger.log(
        `Generating bingo options for theme: "${roomTitle}" using model: ${this.model}`,
      );

      const response = await firstValueFrom(
        this.httpService
          .post<ChatCompletionResponse>(
            this.apiUrl,
            {
              model: this.model,
              messages,
              temperature: 0.8,
              max_tokens: 1000,
              keep_alive: '5m',
            },
            { headers, timeout: this.timeoutMs },
          )
          .pipe(
            timeout(this.timeoutMs),
            catchError((error) => {
              this.logger.error(`LLM API error: ${error.message}`);
              throw error;
            }),
          ),
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      // Parse JSON array from response
      const options = this.parseOptionsFromResponse(content);

      if (options.length < 24) {
        this.logger.warn(
          `LLM returned only ${options.length} options, expected 24. Padding with placeholders.`,
        );
        // Pad with placeholder options if needed
        while (options.length < 24) {
          options.push(`Option ${options.length + 1}`);
        }
      }

      this.logger.log(`Successfully generated ${options.length} bingo options`);
      return options.slice(0, 24);
    } catch (error) {
      this.logger.error(`Failed to generate bingo options: ${error}`);
      throw error;
    }
  }

  private parseOptionsFromResponse(content: string): string[] {
    // Try to extract JSON array from response
    try {
      // First, try direct JSON parse
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      // Try to extract JSON array from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            return parsed.filter((item) => typeof item === 'string');
          }
        } catch {
          this.logger.warn('Failed to parse JSON from LLM response');
        }
      }
    }

    // Fallback: split by newlines and clean up
    this.logger.warn('Using fallback parsing for LLM response');
    return content
      .split('\n')
      .map((line) =>
        line
          .replace(/^[\d.\-*\s]+/, '') // strip list prefixes
          .trim()
          .replace(/^["']+|["']+$/g, '') // strip surrounding quotes
          .replace(/,+$/, '') // strip trailing commas
          .trim(),
      )
      .filter(
        (line) =>
          line.length > 0 && line.length < 100 && /[a-zA-Z]/.test(line),
      )
      .slice(0, 24);
  }
}

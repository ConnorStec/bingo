import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const publicPath = join(__dirname, '..', 'public');
    app.useStaticAssets(publicPath);

    // Serve index.html for all non-API routes (SPA routing)
    app.use((req, res, next) => {
      if (!req.path.startsWith('/rooms') &&
          !req.path.startsWith('/socket.io') &&
          !req.path.includes('.')) {
        res.sendFile(join(publicPath, 'index.html'));
      } else {
        next();
      }
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();

import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

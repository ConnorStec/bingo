import { IsOptional, IsString, MaxLength, IsEnum, IsNotEmpty } from 'class-validator';
import { PrePopulateMode } from '../enums/pre-populate-mode.enum';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsEnum(PrePopulateMode)
  prePopulateMode?: PrePopulateMode;
}

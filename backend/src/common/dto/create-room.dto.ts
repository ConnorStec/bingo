import { IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsBoolean()
  prePopulate?: boolean;
}

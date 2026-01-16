import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEventCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description?: string;
}

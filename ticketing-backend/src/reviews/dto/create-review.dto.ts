import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  eventId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

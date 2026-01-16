import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsBefore } from '../../common/decorators/date-validation.decorator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsNotEmpty()
  @IsString()
  venueName?: string;

  @IsNotEmpty()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  capacity?: number;

  @IsDateString()
  @IsNotEmpty()
  @IsBefore('endTime', {
    message: 'Thời gian Bắt đầu phải trước Thời gian Kết thúc',
  })
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  @IsDateString()
  @IsBefore('closingDate', {
    message: 'Thời gian Mở bán phải trước Thời gian Đóng bán',
  })
  @IsBefore('startTime', {
    message: 'Thời gian Mở bán phải trước Thời gian Bắt đầu',
  })
  releaseDate?: string;

  @IsNotEmpty()
  @IsDateString()
  closingDate?: string;
}

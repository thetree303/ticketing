// src/events/dto/pagination-query.dto.ts
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Các bộ lọc bổ sung khi tìm kiếm
  // Tìm theo tên hoặc địa điểm
  @IsOptional()
  @IsString()
  search?: string;

  // Lọc theo danh mục sự kiện
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  // Lọc theo khoảng thời gian sự kiện
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

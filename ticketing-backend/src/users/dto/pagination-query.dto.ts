// src/events/dto/pagination-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../users/dto/create-user.dto';
import { UserStatus } from '../../users/dto/create-user.dto';

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

  // Lọc theo vai trò người dùng
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // Lọc theo trạng thái người dùng
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

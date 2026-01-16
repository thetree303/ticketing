import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationMetaDto } from '../../events/dto';

export interface PaginateOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMetaDto;
}

/**
 * Paginate a TypeORM QueryBuilder and return standardized pagination response
 * @param queryBuilder - TypeORM SelectQueryBuilder
 * @param options - Pagination options (page, limit)
 * @returns Promise with { data, meta } structure
 */
export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginateOptions,
): Promise<PaginationResult<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [data, totalItems] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalItems / limit);

  const meta: PaginationMetaDto = {
    totalItems,
    itemCount: data.length,
    itemsPerPage: limit,
    totalPages,
    currentPage: page,
  };

  return { data, meta };
}

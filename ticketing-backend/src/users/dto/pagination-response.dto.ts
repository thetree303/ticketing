export class PaginationMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class PaginationResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

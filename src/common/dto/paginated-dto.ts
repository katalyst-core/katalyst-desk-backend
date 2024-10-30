import { ResponseDTO } from './response-dto';

export class PaginationOptions {
  current_page: number;
  per_page: number;
  total_item: number;
  total_page: number;
}

export class PaginatedResponseDTO<T extends ResponseDTO = any> {
  result: T[] | any[];
  pagination: PaginationOptions;
}

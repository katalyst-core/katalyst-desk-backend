import { PaginatedResponseDTO } from '@dto/paginated-dto';
import { ResponseDTO } from '@dto/response-dto';
import { SelectQueryBuilder, Simplify, sql } from 'kysely';
import { BadRequestException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UUID } from 'crypto';
import { customAlphabet } from 'nanoid';
import { v7 as uuidv7 } from 'uuid';
import * as short from 'short-uuid';
import { TableOptionsDTO } from './dto/table-options-dto';

const DEFAULT_STRING = '0123456789abcdefghijklmnopqrstuvwxyz';

const translator = short();

export const shortenUUID = (value: UUID): string => {
  try {
    return translator.fromUUID(value);
  } catch (err) {
    // console.log(err);
    void err;
    throw new BadRequestException({
      message: 'Invalid ID',
      code: 'INVALID_ID',
    });
  }
};

export const restoreUUID = (value: string): UUID => {
  try {
    return translator.toUUID(value) as UUID;
  } catch (err) {
    // console.log(err);
    void err;
    throw new BadRequestException({
      message: 'Invalid ID',
      code: 'INVALID_ID',
    });
  }
};

export const transformDTO = <T extends ResponseDTO = any>(
  data: any,
  dto: { new (...args: any[]): T },
) => {
  const serialize = (c: T) =>
    instanceToPlain(new dto(c), {
      excludeExtraneousValues: true,
    });

  const remap = (c: T | T[]) =>
    Array.isArray(c) ? c.map(serialize) : serialize(c);

  if (data.hasOwnProperty('pagination')) {
    const { result, pagination } = data as PaginatedResponseDTO;

    return {
      result: result.map(serialize),
      pagination,
    } satisfies PaginatedResponseDTO;
  } else {
    return remap(data);
  }
};

export const generateToken = (length: number): string => {
  return customAlphabet(DEFAULT_STRING, length)();
};

export const generateUUID = (): UUID => {
  return uuidv7();
};

export const isValidName = (name: string) => {
  const namePattern = /^[a-zA-Z0-9_]+$/;
  return namePattern.test(name);
};

type ExecuteOptions<T> = {
  transform?: (result: Simplify<T>) => unknown;
  sort?: string[];
  filter?: string[];
};

export const executeWithTableOptions = async <T>(
  builder: SelectQueryBuilder<any, any, T>,
  tableOptions: TableOptionsDTO,
  options?: ExecuteOptions<T>,
) => {
  const { sort, page } = tableOptions;
  const limit = tableOptions.limit || 10; // Default limit to 10

  const sortColumns = options?.sort || [];
  const transform = options?.transform;

  // Obtain the table item count
  const totalItemQuery = await builder
    .clearSelect()
    .clearOrderBy()
    .select(({ fn }) => [fn.countAll<number>().as('total')])
    .executeTakeFirst();
  const totalItem = Number(totalItemQuery.total);
  const totalPage: number = Math.ceil(totalItem / limit);
  const currentPage: number = Math.min(page, totalPage) || 1;

  // Handle sorting
  if (sort) {
    const parameters = sort.split(',');
    parameters.forEach((criterion) => {
      const [column, type] = criterion.split(':');

      if (!sortColumns.includes(column)) return;

      if (!['asc', 'desc'].includes(type)) return;

      builder = builder.orderBy(column, sql`${sql.raw(type)}`);
    });
  }

  // Handle pagination
  builder = builder.limit(limit);
  if (page) {
    builder = builder.offset((currentPage - 1) * limit);
  }

  // Obtain all data
  const result = await builder.execute();

  const tableData = transform ? result.map(transform) : result;

  const data = {
    result: tableData,
    pagination: {
      current_page: currentPage,
      per_page: limit,
      total_item: totalItem,
      total_page: totalPage,
    },
  };

  return data;
};

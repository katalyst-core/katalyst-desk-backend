import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder, Simplify, sql } from 'kysely';
import { instanceToPlain } from 'class-transformer';
import { customAlphabet } from 'nanoid';
import { v7 as uuidv7 } from 'uuid';
import * as short from 'short-uuid';
import { UUID } from 'crypto';

import { Database } from '@database/database';
import { ResponseDTO } from '@dto/response-dto';
import { PaginatedResponseDTO } from '@dto/paginated-dto';

import { TableOptionsDTO } from './dto/table-options-dto';

@Injectable()
export class UtilService {
  private readonly defaultString = '0123456789abcdefghijklmnopqrstuvwxyz';
  private static readonly translator = short();

  constructor(private readonly db: Database) {}

  static shortenUUID(value: UUID): string {
    try {
      return this.translator.fromUUID(value);
    } catch (err) {
      // console.log(err);
      void err;
      throw new BadRequestException({
        message: 'Invalid ID',
        code: 'INVALID_ID',
      });
    }
  }

  static restoreUUID(value: string): UUID {
    try {
      return this.translator.toUUID(value) as UUID;
    } catch (err) {
      // console.log(err);
      void err;
      throw new BadRequestException({
        message: 'Invalid ID',
        code: 'INVALID_ID',
      });
    }
  }

  static TransformDTO<T extends ResponseDTO = any>(
    data: any,
    dto: { new (...args: any[]): T },
  ) {
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
  }

  generateToken(length: number): string {
    return customAlphabet(this.defaultString, length)();
  }

  generatePublicId(): string {
    return this.generateToken(16);
  }

  generateUUID(): UUID {
    return uuidv7();
  }

  isValidName(name: string) {
    const namePattern = /^[a-zA-Z0-9_]+$/;
    return namePattern.test(name);
  }

  async executeWithTableOptions<T>(
    builder: SelectQueryBuilder<any, any, T>,
    tableOptions: TableOptionsDTO,
    transform?: (result: Simplify<T>) => unknown,
  ) {
    const { sort, page } = tableOptions;
    const limit = tableOptions.limit || 10; // Default limit to 10

    // Obtain the table item count
    const totalItemQuery = await builder
      .clearSelect()
      .clearOrderBy()
      .select(this.db.fn.countAll<number>().as('total'))
      .executeTakeFirst();
    const totalItem = Number(totalItemQuery.total);
    const totalPage: number = Math.ceil(totalItem / limit);
    const currentPage: number = Math.min(page, totalPage) || 1;

    // Handle sorting
    if (sort) {
      const parameters = sort.split(',');
      parameters.forEach((criterion) => {
        const [column, type] = criterion.split(':');

        if (!['asc', 'desc'].includes(type)) {
          throw new BadRequestException({
            message: 'Invalid sorting type',
            code: 'INVALID_SORT_TYPE',
          });
        }

        builder = builder.orderBy(column, sql`${sql.raw(type)}`);
      });
    }

    // Handle pagination
    builder = builder.limit(limit);
    if (page) {
      builder = builder.offset((currentPage - 1) * limit);
    }

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
  }
}

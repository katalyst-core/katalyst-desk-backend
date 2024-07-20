import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { SelectQueryBuilder, Simplify, sql } from 'kysely';
import { customAlphabet } from 'nanoid';
import * as short from 'short-uuid';

import { Database } from 'src/database/database';
import { TableOptionsDTO } from './dto/table-options-dto';

@Injectable()
export class UtilService {
  private readonly defaultString = '0123456789abcdefghijklmnopqrstuvwxyz';
  private readonly translator = short();

  constructor(private readonly db: Database) {}

  generateToken(length: number): string {
    return customAlphabet(this.defaultString, length)();
  }

  generatePublicId(): string {
    return this.generateToken(16);
  }

  shortenUUID(value: UUID): string {
    try {
      return this.translator.fromUUID(value);
    } catch (_) {
      throw new BadRequestException({
        message: 'Invalid request',
        code: 'INVALID_REQUEST',
      });
    }
  }

  restoreUUID(value: string): UUID {
    try {
      return this.translator.toUUID(value) as UUID;
    } catch (_) {
      throw new BadRequestException({
        message: 'Invalid request',
        code: 'INVALID_REQUEST',
      });
    }
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
      .select(this.db.fn.countAll<number>().as('total'))
      .executeTakeFirst();
    const totalItem = totalItemQuery.total;
    const totalPage = Math.ceil(totalItem / limit);
    const currentPage = Math.min(page, totalPage) || 1;

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
      table: tableData,
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

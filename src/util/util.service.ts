import { BadRequestException, Injectable } from '@nestjs/common';
import { count, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';
import { customAlphabet } from 'nanoid';
import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import { TableOptionsDTO } from 'src/product/dto/table-options-dto';

@Injectable()
export class UtilService {
  private readonly defaultString = '0123456789abcdefghijklmnopqrstuvwxyz';
  private readonly db: Drizzle;

  constructor(drizzle: DrizzleService) {
    this.db = drizzle.db;
  }

  generateToken(length: number): string {
    return customAlphabet(this.defaultString, length)();
  }

  generatePublicId(): string {
    return this.generateToken(16);
  }

  isValidName(name: string) {
    const namePattern = /^[a-zA-Z0-9_]+$/;
    return namePattern.test(name);
  }

  async withTableOptions<T extends PgSelect>(
    builder: T,
    tableOptions: TableOptionsDTO,
  ) {
    const { sort, page } = tableOptions;
    const limit = tableOptions.limit || 10; // Default limit to 10

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

        builder.orderBy(sql`${sql.raw(column)} ${sql.raw(type)}`);
      });
    }

    // Obtain the table item count
    const baseQuery = this.db.$with('bq').as(builder);
    const totalItemQuery = await this.db
      .with(baseQuery)
      .select({ count: count() })
      .from(baseQuery);
    const totalItem = totalItemQuery[0].count;
    const totalPage = Math.ceil(totalItem / limit);
    const currentPage = Math.min(page, totalPage) || 1;

    // Handle pagination
    builder.limit(limit);
    if (page) {
      builder.offset((currentPage - 1) * limit);
    }

    const result = await builder;

    const data = {
      table: result,
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

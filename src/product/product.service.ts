import { BadRequestException, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { MasterProduct, Store, User } from 'src/database/database-schema';
import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import { UtilService } from 'src/util/util.service';
import { TableOptionsDTO } from './dto/table-options-dto';

@Injectable()
export class ProductService {
  private db: Drizzle;
  constructor(
    drizzle: DrizzleService,
    private readonly util: UtilService,
  ) {
    this.db = drizzle.db;
  }

  async getProductList(
    storePublicId: string,
    userPublicId: string,
    tableOptions: TableOptionsDTO,
  ) {
    const productBuilder = this.db
      .select({
        product_id: MasterProduct.publicId,
        name: MasterProduct.name,
        sku: MasterProduct.sku,
        active: MasterProduct.active,
      })
      .from(MasterProduct)
      .innerJoin(Store, eq(Store.publicId, storePublicId))
      .innerJoin(User, eq(User.userId, Store.ownerId))
      .where(
        and(
          eq(MasterProduct.storeId, Store.storeId),
          eq(User.publicId, userPublicId),
        ),
      )
      .$dynamic();

    const products = await this.util.withTableOptions(
      productBuilder,
      tableOptions,
    );

    return products;
  }

  async deleteProducts(productIds: string[], userPublicId: string) {
    await this.db.transaction(async (tx) => {
      const store = tx
        .$with('store')
        .as(
          this.db
            .select({ store_id: Store.storeId })
            .from(Store)
            .innerJoin(User, eq(User.userId, Store.ownerId))
            .where(eq(User.publicId, userPublicId)),
        );

      const deleteProducts = await tx
        .with(store)
        .delete(MasterProduct)
        .where(
          and(
            inArray(MasterProduct.storeId, sql`(select * from ${store})`),
            inArray(MasterProduct.publicId, productIds),
          ),
        )
        .returning({ id: MasterProduct.productId });

      if (productIds.length !== deleteProducts.length) {
        throw new BadRequestException({
          message: 'Invalid request',
          code: 'INVALID_REQUEST',
        });
      }
    });
  }
}

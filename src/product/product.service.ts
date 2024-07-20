import { Injectable } from '@nestjs/common';

import { UtilService } from 'src/util/util.service';
import { TableOptionsDTO } from '../util/dto/table-options-dto';
import { Database } from 'src/database/database';
import { UUID } from 'crypto';

@Injectable()
export class ProductService {
  private readonly dbx;
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
  ) {}

  async getStoreProductList(
    storeId: UUID,
    userId: UUID,
    tableOptions: TableOptionsDTO,
  ) {
    const productBuilder = this.db
      .selectFrom('masterProduct')
      .innerJoin('store', 'store.storeId', 'masterProduct.storeId')
      .select([
        'masterProduct.productId',
        'masterProduct.name',
        'masterProduct.sku',
        'masterProduct.active',
      ])
      .where('masterProduct.storeId', '=', storeId)
      .where('store.ownerId', '=', userId);

    const products = await this.util.executeWithTableOptions(
      productBuilder,
      tableOptions,
      (result) => {
        const { productId, name, sku, active } = result;
        const shortProductId = this.util.shortenUUID(productId);

        return {
          product_id: shortProductId,
          name,
          sku,
          active,
        };
      },
    );

    return products;
  }

  async deleteProducts(productIds: UUID[], userId: UUID) {
    return await this.db.transaction().execute(async (tx) => {
      const deleted = await tx
        .deleteFrom('masterProduct')
        .where(
          'masterProduct.storeId',
          'in',
          tx
            .selectFrom('store')
            .select('store.storeId')
            .where('store.ownerId', '=', userId),
        )
        .where('masterProduct.productId', 'in', productIds)
        .executeTakeFirst();

      const totalSuccess = deleted.numDeletedRows;
      const totalFailed = BigInt(productIds.length) - totalSuccess;
      return {
        total_success: Number(totalSuccess),
        total_failed: Number(totalFailed.toString()),
      };
    });
  }
}

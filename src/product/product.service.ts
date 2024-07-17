import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { MasterProduct, Store } from 'src/database/database-schema';
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

  async getProductList(storePublicId: string, tableOptions: TableOptionsDTO) {
    const productBuilder = this.db
      .select({
        product_id: MasterProduct.publicId,
        name: MasterProduct.name,
        sku: MasterProduct.sku,
        active: MasterProduct.active,
      })
      .from(MasterProduct)
      .innerJoin(Store, eq(Store.publicId, storePublicId))
      .where(eq(MasterProduct.storeId, Store.storeId))
      .$dynamic();

    const products = await this.util.withTableOptions(
      productBuilder,
      tableOptions,
    );

    return products;
  }
}

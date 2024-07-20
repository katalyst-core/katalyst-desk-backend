import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ProductService } from './product.service';
import { TableOptionsDTO } from '../util/dto/table-options-dto';
import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { User } from 'src/decorator/User';
import { AccessUser } from 'src/auth/auth.type';
import { DeleteProductsDTO } from './dto/delete-products.dto';
import { UtilService } from 'src/util/util.service';

@UseGuards(JWTAccess)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly util: UtilService,
  ) {}

  @Get('list/:id')
  async list(
    @User() user: AccessUser,
    @Param('id') shortStoreId: string,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const { userId } = user;
    const storeId = this.util.restoreUUID(shortStoreId);

    const products = await this.productService.getStoreProductList(
      storeId,
      userId,
      tableOptions,
    );

    return {
      message: 'Successfully retrieved products',
      data: products,
    };
  }

  @Delete('delete')
  async delete(
    @User() user: AccessUser,
    @Body() deleteProducts: DeleteProductsDTO,
  ) {
    const { userId } = user;
    const shortProductIds = deleteProducts.product_id;
    const productIds = shortProductIds.map((pid) => this.util.restoreUUID(pid));

    const deleted = await this.productService.deleteProducts(
      productIds,
      userId,
    );

    return {
      message: 'Successfully deleted',
      data: deleted,
    };
  }
}

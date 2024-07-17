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
import { TableOptionsDTO } from './dto/table-options-dto';
import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { User } from 'src/decorator/User';
import { AccessUser } from 'src/auth/auth.type';
import { DeleteProductsDTO } from './dto/delete-products.dto';

@UseGuards(JWTAccess)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('list/:id')
  async list(
    @User() user: AccessUser,
    @Param('id') id: string,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const userPublicId = user.publicId;

    const products = await this.productService.getProductList(
      id,
      userPublicId,
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
    const userPublicId = user.publicId;
    const productIds = deleteProducts.ids;

    await this.productService.deleteProducts(productIds, userPublicId);

    return {
      message: 'Successfully deleted',
    };
  }
}

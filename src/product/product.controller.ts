import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { TableOptionsDTO } from './dto/table-options-dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('list/:id')
  async list(@Param('id') id: string, @Query() tableOptions: TableOptionsDTO) {
    const products = await this.productService.getProductList(id, tableOptions);

    return {
      message: 'Successfully retrieved products',
      data: products,
    };
  }
}

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { StoreService } from './store.service';
import { CreateStoreDTO } from './dto/create-store-dto';
import { AccessUser } from 'src/auth/auth.type';

@UseGuards(JWTAccess)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('create')
  async create(@Req() req: Request, @Body() data: CreateStoreDTO) {
    const { name } = data;

    const user = req.user as AccessUser;
    const userPublicId = user.publicId;

    const store = await this.storeService.createStore(name, userPublicId);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully created a new store',
      data: store,
    };
  }

  @Get('list')
  async list(@Req() req: Request) {
    const user = req.user as AccessUser;
    const userPublicId = user.publicId;

    const stores = await this.storeService.listUserStores(userPublicId);

    return {
      message: `Successfully retrieved user's stores`,
      data: stores,
    };
  }
}

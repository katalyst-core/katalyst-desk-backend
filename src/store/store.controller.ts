import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { StoreService } from './store.service';
import { CreateStoreDTO } from './dto/create-store-dto';
import { AccessUser } from 'src/auth/auth.type';
import { JWTAccess } from 'src/auth/strategy/jwt-access.strategy';
import { User } from 'src/decorator/User';

@UseGuards(JWTAccess)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('create')
  async create(@User() user: AccessUser, @Body() data: CreateStoreDTO) {
    const { userId } = user;

    const { name } = data;
    const store = await this.storeService.createStore(name, userId);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully created a new store',
      data: store,
    };
  }

  @Get('list')
  async list(@User() user: AccessUser) {
    const { userId } = user;

    const stores = await this.storeService.listUserStores(userId);

    return {
      message: `Successfully retrieved user's stores`,
      data: stores,
    };
  }
}

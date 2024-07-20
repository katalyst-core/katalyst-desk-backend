import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';

import { UtilService } from 'src/util/util.service';

@Injectable()
export class StoreService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
  ) {}

  async createStore(name: string, userId: UUID) {
    return await this.db.transaction().execute(async (tx) => {
      const store = await tx
        .selectFrom('store')
        .where('store.name', 'ilike', name)
        .executeTakeFirst();

      if (store) {
        throw new BadRequestException({
          message: 'A store with that name already exist',
          code: 'STORE_NAME_ALREADY_EXIST',
        });
      }

      const newStore = await tx
        .insertInto('store')
        .values({
          name,
          ownerId: userId,
          created_by: userId,
        })
        .returning(['store.storeId', 'store.name'])
        .executeTakeFirst();

      return newStore;
    });
  }

  async listUserStores(userId: UUID) {
    const qStores = await this.db
      .selectFrom('store')
      .select(['store.storeId', 'store.name'])
      .where('store.ownerId', '=', userId)
      .execute();

    const stores = qStores.map((store) => {
      const { storeId, name } = store;
      const shortStoreId = this.util.shortenUUID(storeId);

      return {
        id: shortStoreId,
        name,
      };
    });

    return stores;
  }
}

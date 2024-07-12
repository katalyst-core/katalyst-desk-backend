import { BadRequestException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { Store, User } from 'src/database/database-schema';
import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class StoreService {
  private readonly db: Drizzle;
  constructor(
    drizzle: DrizzleService,
    private readonly util: UtilService,
  ) {
    this.db = drizzle.db;
  }

  async createStore(name: string, userPublicId: string) {
    return await this.db.transaction(async (tx) => {
      const users = await tx.select({ id: User.userId }).from(User).where(eq(User.publicId, userPublicId));

      if (users.length === 0) {
        throw new BadRequestException({
          message: 'Cannot find user',
          code: 'USER_NOT_EXIST'
        });
      }

      const stores = await tx.select().from(Store).where(eq(Store.name, name));

      if (stores.length > 0) {
        throw new BadRequestException({
          message: 'A store with that name already exist',
          code: 'STORE_NAME_ALREADY_EXIST',
        });
      }

      const publicId = this.util.generatePublicId();

      const store = await tx.insert(Store).values({
        publicId,
        name,
        ownerId: users[0].id
      }).returning({
        id: Store.publicId,
        name: Store.name,
      });

      return store[0];
    });
  }

  async listUserStores(userPublicId: string) {
    const stores = await this.db
      .select({
        id: Store.publicId,
        name: Store.name,
      })
      .from(Store)
      .innerJoin(User, eq(User.publicId, userPublicId));

    return stores;
  }
}

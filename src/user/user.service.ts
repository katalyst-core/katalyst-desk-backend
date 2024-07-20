import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class UserService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
  ) {}

  async getUserInfo(userId: UUID) {
    const user = await this.db
      .selectFrom('user')
      .select(['user.name', 'user.username'])
      .where('user.userId', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new BadRequestException('Unable to find user');
    }

    const shortUserId = this.util.shortenUUID(userId);

    return {
      id: shortUserId,
      ...user,
    };
  }
}

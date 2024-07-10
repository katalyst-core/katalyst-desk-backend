import { BadRequestException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { User } from 'src/database/database-schema';
import { Drizzle, DrizzleService } from 'src/database/drizzle.service';

@Injectable()
export class UserService {
  private readonly db: Drizzle;
  constructor(drizzle: DrizzleService) {
    this.db = drizzle.db;
  }

  async getUserInfo(publicId: string) {
    const user = await this.db
      .select({
        username: User.username,
        email: User.email,
      })
      .from(User)
      .where(eq(User.publicId, publicId));

    if (user.length === 0) {
      throw new BadRequestException('Unable to find user');
    }

    return {
      id: publicId,
      ...user[0],
    };
  }
}

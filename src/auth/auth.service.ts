import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UtilService } from 'src/util/util.service';
import { CreateUserDTO } from './dto/create-user-dto';
import { AccessContent, RefreshContent } from './auth.type';
import { Database } from 'src/database/database';
import { UUID } from 'crypto';
import { sql } from 'kysely';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createUser(data: CreateUserDTO) {
    const { name, username, email, password } = data;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.db.transaction().execute(async (tx) => {
      const exUser = await tx
        .selectFrom('user')
        .select(['user.username', 'user.email'])
        .where((eb) =>
          eb.or([
            eb('user.username', 'ilike', username),
            eb('user.email', 'ilike', email),
          ]),
        )
        .executeTakeFirst();

      if (exUser) {
        if (exUser.email.toLowerCase() === email.toLowerCase()) {
          throw new BadRequestException({
            message: 'An account with that email already exist',
            code: 'ACCOUNT_EMAIL_ALREADY_EXIST',
          });
        }

        if (exUser.username.toLowerCase() === username.toLowerCase()) {
          throw new BadRequestException({
            message: 'An account with that username already exist',
            code: 'ACCOUNT_USERNAME_ALREADY_EXIST',
          });
        }
      }

      const user = await tx
        .insertInto('user')
        .values({
          name,
          username,
          email,
        })
        .returning('user.userId')
        .executeTakeFirst();

      await tx
        .insertInto('basicUserAuthentication')
        .values({
          userId: user.userId,
          passwordHash,
          created_by: user.userId,
        })
        .execute();
    });
  }

  async createAccessToken(userId: UUID) {
    const shortUserId = this.util.shortenUUID(userId);

    const payload = {
      sub: shortUserId,
    } satisfies AccessContent;

    const tokenSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const tokenExpiry = 60; // 1 Minute
    const options = {
      secret: tokenSecret,
      expiresIn: `${tokenExpiry}s`,
    };

    const token = this.jwt.sign(payload, options);

    return {
      name: 'Authentication',
      value: token,
      options: {
        maxAge: tokenExpiry * 1000,
      },
    };
  }

  async createRefreshToken(userId: UUID, oldSessionToken?: string) {
    const user = await this.db
      .selectFrom('user')
      .select('user.userId')
      .where('user.userId', '=', userId)
      .executeTakeFirst();

    if (!user) {
      throw new BadRequestException('Unable to find user');
    }

    const sessionToken = this.util.generateToken(12);
    try {
      if (oldSessionToken) {
        await this.db
          .updateTable('userSession')
          .set({
            userId,
            sessionToken,
            updated_at: sql`CURRENT_TIMESTAMP`,
            updated_by: userId,
          })
          .where('userSession.userId', '=', userId)
          .where('userSession.sessionToken', '=', oldSessionToken)
          .execute();
      } else {
        await this.db
          .insertInto('userSession')
          .values({
            userId,
            sessionToken,
            created_by: userId,
          })
          .execute();
      }
    } catch (err) {
      throw new BadRequestException('Unable to create session token');
    }

    const shortUserId = this.util.shortenUUID(userId);

    const payload = {
      sub: shortUserId,
      session_token: sessionToken,
    } satisfies RefreshContent;

    const tokenSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const tokenExpiry = 604800; // 7 Days
    const options = {
      secret: tokenSecret,
      expiresIn: `${tokenExpiry}s`,
    };

    const token = this.jwt.sign(payload, options);

    return {
      name: 'Refresh',
      value: token,
      options: {
        maxAge: tokenExpiry * 1000,
      },
    };
  }
}

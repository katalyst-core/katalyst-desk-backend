import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { and, eq, or } from 'drizzle-orm';

import * as bcrypt from 'bcrypt';

import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import {
  BasicUserAuthentication,
  User,
  UserSession,
} from 'src/database/database-schema';
import { UtilService } from 'src/util/util.service';
import { CreateUserDTO } from './dto/create-user-dto';
import { AccessContent, RefreshContent } from './auth.type';

@Injectable()
export class AuthService {
  private db: Drizzle;
  constructor(
    drizzle: DrizzleService,
    private readonly util: UtilService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.db = drizzle.db;
  }

  async createUser(data: CreateUserDTO) {
    const { name, username, email, password } = data;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.db.transaction(async (tx) => {
      const exUser = await tx
        .select({
          username: User.username,
          email: User.email,
        })
        .from(User)
        .where(or(eq(User.username, username), eq(User.email, email)));

      if (exUser.length > 0) {
        if (exUser[0].username === username) {
          throw new BadRequestException({
            message: 'An account with that username already exist',
            code: 'ACCOUNT_USERNAME_ALREADY_EXIST',
          });
        }

        if (exUser[0].email === email) {
          throw new BadRequestException({
            message: 'An account with that email already exist',
            code: 'ACCOUNT_EMAIL_ALREADY_EXIST',
          });
        }
      }

      const publicId = this.util.generatePublicId();
      const user = await tx
        .insert(User)
        .values({
          publicId,
          name,
          username,
          email,
        })
        .returning({
          userId: User.userId,
        });
      await tx.insert(BasicUserAuthentication).values({
        userId: user[0].userId,
        passwordHash,
      });
    });
  }

  async createAccessToken(publicId: string) {
    const payload = {
      sub: publicId,
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

  async createRefreshToken(publicId: string, oldSessionToken?: string) {
    const user = await this.db
      .select({ userId: User.userId })
      .from(User)
      .where(eq(User.publicId, publicId));

    if (user.length === 0) {
      throw new BadRequestException('Unable to find user');
    }

    if (oldSessionToken) {
      await this.db
        .delete(UserSession)
        .where(
          and(
            eq(UserSession.userId, user[0].userId),
            eq(UserSession.sessionToken, oldSessionToken),
          ),
        );
    }

    const sessionToken = this.util.generateToken(16);
    try {
      await this.db.insert(UserSession).values({
        userId: user[0].userId,
        sessionToken,
      });
    } catch (err) {
      throw new BadRequestException('Unable to create session token');
    }

    const payload = {
      sub: publicId,
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

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { eq, or } from 'drizzle-orm';
import { Strategy } from 'passport-local';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcrypt';

import { User, BasicUserAuthentication } from 'src/database/database-schema';
import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import { LocalUser } from '../auth.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private db: Drizzle;
  constructor(private readonly drizzle: DrizzleService) {
    super({
      username: 'username',
      password: 'password',
    });

    this.db = this.drizzle.db;
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.db
      .select({
        publicId: User.publicId,
        passwordHash: BasicUserAuthentication.passwordHash,
      })
      .from(User)
      .innerJoin(
        BasicUserAuthentication,
        eq(User.userId, BasicUserAuthentication.userId),
      )
      .where(or(eq(User.username, username), eq(User.email, username)));

    const exception = new UnauthorizedException({
      message: 'Unable to find account',
      code: 'UNABLE_TO_FIND_ACCOUNT',
    });

    if (user.length === 0) {
      throw exception;
    }

    const { publicId, passwordHash } = user[0];

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw exception;
    }

    return {
      publicId,
    } satisfies LocalUser;
  }
}

export class LocalGuard extends AuthGuard('local') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) throw err || new UnauthorizedException();

    void info, context, status;

    return user;
  }
}

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcrypt';

import { LocalUser } from '../auth.type';
import { Database } from 'src/database/database';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: Database) {
    super({
      username: 'username',
      password: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.db
      .selectFrom('user')
      .innerJoin(
        'basicUserAuthentication',
        'user.userId',
        'basicUserAuthentication.userId',
      )
      .select(['user.userId', 'basicUserAuthentication.passwordHash'])
      .where((eb) =>
        eb.or([
          eb('user.username', '=', username),
          eb('user.email', '=', username),
        ]),
      )
      .executeTakeFirst();

    const exception = new UnauthorizedException({
      message: 'Unable to find account',
      code: 'UNABLE_TO_FIND_ACCOUNT',
    });

    if (!user) {
      throw exception;
    }

    const { userId, passwordHash } = user;

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw exception;
    }

    return {
      userId,
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

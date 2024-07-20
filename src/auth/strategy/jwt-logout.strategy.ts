import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { Database } from 'src/database/database';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class JWTLogoutStrategy extends PassportStrategy(
  Strategy,
  'jwt-logout',
) {
  constructor(
    config: ConfigService,
    private readonly db: Database,
    private readonly util: UtilService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Refresh,
      ]),
      ignoreExpiration: true,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: any) {
    const { sub: shortUserId, session_token: sessionToken } = payload;

    const userId = this.util.restoreUUID(shortUserId);

    try {
      const user = await this.db
        .selectFrom('user')
        .select('user.userId')
        .where('user.userId', '=', userId)
        .executeTakeFirst();

      if (!user) {
        throw new BadRequestException();
      }

      await this.db
        .deleteFrom('userSession')
        .where('userSession.userId', '=', userId)
        .where('userSession.sessionToken', '=', sessionToken)
        .execute();
    } catch (err) {
      console.log(err);
      // Log something here
    }

    return {};
  }
}

export class JWTLogout extends AuthGuard('jwt-logout') {
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

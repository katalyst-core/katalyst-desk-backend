import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { RefreshUser } from '../auth.type';
import { Database } from 'src/database/database';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
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
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: any) {
    const { sub: shortUserId, session_token: sessionToken } = payload;

    const userId = this.util.restoreUUID(shortUserId);

    const user = await this.db
      .selectFrom('userSession')
      .where('userSession.userId', '=', userId)
      .where('userSession.sessionToken', '=', sessionToken)
      .executeTakeFirst();

    if (!user) throw new UnauthorizedException();

    return {
      userId,
      sessionToken,
    } satisfies RefreshUser;
  }
}

export class JWTRefresh extends AuthGuard('jwt-refresh') {
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

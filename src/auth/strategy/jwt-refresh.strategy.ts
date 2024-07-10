import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { and, eq } from 'drizzle-orm';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { Drizzle, DrizzleService } from 'src/database/drizzle.service';
import { RefreshUser } from '../auth.type';
import { User, UserSession } from 'src/database/database-schema';

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private db: Drizzle;

  constructor(config: ConfigService, drizzle: DrizzleService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Refresh,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });

    this.db = drizzle.db;
  }

  async validate(_request: Request, payload: any) {
    const { sub: publicId, session_token: sessionToken } = payload;

    const user = await this.db
      .select()
      .from(User)
      .innerJoin(UserSession, eq(User.userId, UserSession.userId))
      .where(
        and(
          eq(User.publicId, publicId),
          eq(UserSession.sessionToken, sessionToken),
        ),
      );

    if (user.length === 0) throw new UnauthorizedException();

    return {
      publicId: payload.sub,
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

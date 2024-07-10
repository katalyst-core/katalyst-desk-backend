import {
  BadRequestException,
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
import { User, UserSession } from 'src/database/database-schema';

@Injectable()
export class JWTLogoutStrategy extends PassportStrategy(
  Strategy,
  'jwt-logout',
) {
  private db: Drizzle;

  constructor(config: ConfigService, drizzle: DrizzleService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Refresh,
      ]),
      ignoreExpiration: true,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });

    this.db = drizzle.db;
  }

  async validate(_request: Request, payload: any) {
    const { sub: publicId, session_token: sessionToken } = payload;

    try {
      const user = await this.db
        .select({ userId: User.userId })
        .from(User)
        .where(eq(User.publicId, publicId));

      if (user.length === 0) {
        throw new BadRequestException();
      }

      await this.db
        .delete(UserSession)
        .where(
          and(
            eq(UserSession.userId, user[0].userId),
            eq(UserSession.sessionToken, sessionToken),
          ),
        );
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

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { restoreUUID } from '@util/.';
import { Database } from '@database/database';
import { ApiConfigService } from '@config/api-config.service';

import { AgentRefresh, AgentRefreshJWT } from '../auth.type';

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ApiConfigService,
    private readonly db: Database,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies['katalyst-desk-refresh'],
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getJWTRefreshPrivateKey,
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: AgentRefreshJWT) {
    const { sub: shortAgentId, session_token: shortSessionId } = payload;

    const agentId = restoreUUID(shortAgentId);
    const sessionToken = restoreUUID(shortSessionId);

    const agent = await this.db
      .selectFrom('agentSession')
      .where('agentSession.agentId', '=', agentId)
      .where('agentSession.sessionToken', '=', sessionToken)
      .executeTakeFirst();

    if (!agent) {
      throw new UnauthorizedException();
    }

    return {
      agentId,
      sessionToken,
    } satisfies AgentRefresh;
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

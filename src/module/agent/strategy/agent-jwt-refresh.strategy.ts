import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { ApiConfigService } from 'src/config/api-config.service';
import { Database } from 'src/database/database';
import { UtilService } from 'src/util/util.service';
import { AgentRefresh, AgentRefreshJWT } from '../agent.type';

@Injectable()
export class AgentJWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'agent-jwt-refresh',
) {
  constructor(
    config: ApiConfigService,
    private readonly db: Database,
    private readonly util: UtilService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Refresh,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getJWTRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: AgentRefreshJWT) {
    const { sub: shortAgentId, session_token: shortSessionId } = payload;

    const agentId = UtilService.restoreUUID(shortAgentId);
    const sessionToken = UtilService.restoreUUID(shortSessionId);

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

export class AgentJWTRefresh extends AuthGuard('agent-jwt-refresh') {
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

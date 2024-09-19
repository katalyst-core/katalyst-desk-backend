import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

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
    const { sub: shortAgentId, session_id: shortSessionId } = payload;

    const agentId = this.util.restoreUUID(shortAgentId);
    const sessionId = this.util.restoreUUID(shortSessionId);

    const agent = await this.db
      .selectFrom('agentSession')
      .where('agentSession.agentId', '=', agentId)
      .where('agentSession.sessionId', '=', sessionId)
      .executeTakeFirst();

    if (!agent) {
      throw new UnauthorizedException();
    }

    return {
      agentId,
      sessionId,
    } satisfies AgentRefresh;
  }
}

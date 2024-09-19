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
import { UtilService } from 'src/util/util.service';
import { AgentAccess, AgentAccessJWT } from '../agent.type';

@Injectable()
export class AgentJWTAccessStrategy extends PassportStrategy(
  Strategy,
  'agent-jwt-access',
) {
  constructor(
    config: ApiConfigService,
    private readonly util: UtilService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.Authentication,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getJWTAccessSecret,
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: AgentAccessJWT) {
    const { sub: shortAgentId } = payload;
    const agentId = this.util.restoreUUID(shortAgentId);

    return {
      agentId,
    } satisfies AgentAccess;
  }
}

export class AgentJWTAccess extends AuthGuard('agent-jwt-access') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    agent: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !agent) throw err || new UnauthorizedException();

    void info, context, status;

    return agent;
  }
}

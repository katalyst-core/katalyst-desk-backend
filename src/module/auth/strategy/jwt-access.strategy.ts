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
import { AgentAccess, AgentAccessJWT } from '../auth.type';

@Injectable()
export class JWTAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(config: ApiConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getJWTAccessPrivateKey,
      passReqToCallback: true,
    });
  }

  async validate(_request: Request, payload: AgentAccessJWT) {
    const { sub: shortAgentId } = payload;
    const agentId = UtilService.restoreUUID(shortAgentId);

    return {
      agentId,
    } satisfies AgentAccess;
  }
}

export class JWTAccess extends AuthGuard('jwt-access') {
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

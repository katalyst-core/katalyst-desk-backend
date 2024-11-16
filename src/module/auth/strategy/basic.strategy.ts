import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { Observable } from 'rxjs';

import { Database } from '@database/database';
import { AgentBasicAuth } from '../auth.type';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly db: Database) {
    super({
      username: 'username',
      password: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const agent = await this.db
      .selectFrom('agent')
      .innerJoin('agentAuth', 'agent.agentId', 'agentAuth.agentId')
      .select(['agent.agentId', 'agentAuth.authValue'])
      .where('agentAuth.authType', 'like', 'basic')
      .where('agent.email', 'like', email)
      .executeTakeFirst();

    const exception = new UnauthorizedException({
      message: 'Unable to find account',
      code: 'UNABLE_TO_FIND_ACCOUNT',
    });

    if (!agent) {
      throw exception;
    }

    const { agentId, authValue: passwordHash } = agent;

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw exception;
    }

    return {
      agentId,
    } satisfies AgentBasicAuth;
  }
}

export class BasicGuard extends AuthGuard('basic') {
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

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UUID } from 'crypto';
import { CookieOptions } from 'express';
import * as bcrypt from 'bcrypt';

import { ApiConfigService } from '@config/api-config.service';
import { Database } from '@database/database';
import { UtilService } from '@util/util.service';

import { NewAgentDTO } from './dto/new-agent-dto';
import { AgentAccessJWT, AgentGatewayJWT, AgentRefreshJWT } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
    private readonly config: ApiConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createAgent(data: NewAgentDTO) {
    const { name, email, password } = data;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.db.transaction().execute(async (tx) => {
      const exAgent = await tx
        .selectFrom('agent')
        .select('agent.email')
        .where('agent.email', 'ilike', email)
        .executeTakeFirst();

      if (exAgent && exAgent.email.toLowerCase() === email.toLowerCase()) {
        throw new BadRequestException({
          message: 'An account with that email already exist',
          code: 'AGENT_EMAIL_ALREADY_EXIST',
        });
      }

      const agent = await tx
        .insertInto('agent')
        .values({
          name,
          email,
        })
        .returning('agent.agentId')
        .executeTakeFirst();

      await tx
        .insertInto('agentAuth')
        .values({
          agentId: agent.agentId,
          authType: 'basic',
          authValue: passwordHash,
          createdBy: agent.agentId,
        })
        .execute();
    });
  }

  createAccessToken(agentId: UUID) {
    const shortAgentId = UtilService.shortenUUID(agentId);

    const payload = {
      sub: shortAgentId,
    } satisfies AgentAccessJWT;

    const tokenPrivateKey = this.config.getJWTAccessPrivateKey;
    const tokenExpiry = this.config.getJWTAccessExpiry;
    const options = {
      algorithm: 'RS256',
      privateKey: tokenPrivateKey,
      expiresIn: `${tokenExpiry}s`,
    } satisfies JwtSignOptions;

    const token = this.jwt.sign(payload, options);

    return token;
  }

  async createRefreshToken(agentId: UUID, oldSessionToken?: UUID) {
    const agent = await this.db
      .selectFrom('agent')
      .select('agent.agentId')
      .where('agent.agentId', '=', agentId)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: `Agent doesn't exist`,
        code: 'AGENT_DOES_NOT_EXIST',
      });
    }

    const newSessionToken = this.util.generateUUID();

    try {
      if (oldSessionToken) {
        await this.db
          .updateTable('agentSession')
          .set({
            sessionToken: newSessionToken,
          })
          .where('agentSession.sessionToken', '=', oldSessionToken)
          .execute();
      } else {
        await this.db
          .insertInto('agentSession')
          .values({
            agentId,
            sessionToken: newSessionToken,
            createdBy: agentId,
          })
          .returning('agentSession.sessionToken')
          .executeTakeFirst();
      }

      const shortAgentId = UtilService.shortenUUID(agentId);
      const shortSessionToken = UtilService.shortenUUID(newSessionToken);

      const payload = {
        sub: shortAgentId,
        session_token: shortSessionToken,
      } satisfies AgentRefreshJWT;

      const tokenPrivateKey = this.config.getJWTRefreshPrivateKey;
      const tokenExpiry = this.config.getJWTRefreshExpiry; // 7 Days
      const options = {
        algorithm: 'RS256',
        secret: tokenPrivateKey,
        expiresIn: `${tokenExpiry}s`,
      } satisfies JwtSignOptions;

      const token = this.jwt.sign(payload, options);

      return {
        name: 'katalyst-desk-refresh',
        value: token,
        options: {
          maxAge: tokenExpiry * 1000,
          sameSite: 'lax',
          path: '/auth',
        } satisfies CookieOptions,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        message: 'Unable to create session',
        code: 'CANNOT_CREATE_SESSION_TOKEN',
      });
    }
  }

  async deleteSessionByToken(refreshToken: string) {
    try {
      const jwtRefreshPrivateKey = this.config.getJWTRefreshPrivateKey;
      const decodedToken = this.jwt.verify(refreshToken, {
        publicKey: jwtRefreshPrivateKey,
      });

      if (!(decodedToken satisfies AgentRefreshJWT)) {
        return;
      }

      const { sub: shortAgentId, session_token: shortSessionToken } =
        decodedToken;
      const agentId = UtilService.restoreUUID(shortAgentId);
      const sessionToken = UtilService.restoreUUID(shortSessionToken);

      await this.db
        .deleteFrom('agentSession')
        .where('agentSession.agentId', '=', agentId)
        .where('agentSession.sessionToken', '=', sessionToken)
        .execute();
    } catch (err) {
      void err;
    }
  }

  createGatewayToken(agentId: UUID, ip: string) {
    const shortAgentId = UtilService.shortenUUID(agentId);

    const payload = {
      sub: shortAgentId,
      ip_address: ip,
    } satisfies AgentGatewayJWT;

    const tokenPrivateKey = this.config.getJWTGatewayPrivateKey;
    const tokenExpiry = this.config.getJWTGatewayExpiry;
    const options = {
      algorithm: 'RS256',
      privateKey: tokenPrivateKey,
      expiresIn: `${tokenExpiry}s`,
    } satisfies JwtSignOptions;

    const token = this.jwt.sign(payload, options);

    return token;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { ApiConfigService } from 'src/config/api-config.service';
import { Database } from 'src/database/database';
import { UtilService } from 'src/util/util.service';
import { NewAgentDTO } from './dto/new-agent-dto';
import { UUID } from 'crypto';
import { AgentAccessJWT, AgentRefreshJWT } from './agent.type';

@Injectable()
export class AgentService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
    private readonly config: ApiConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createUser(data: NewAgentDTO) {
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

  async createAccessToken(agentId: UUID) {
    const shortAgentId = this.util.shortenUUID(agentId);

    const payload = {
      sub: shortAgentId,
    } satisfies AgentAccessJWT;

    const tokenSecret = this.config.getJWTAccessSecret;
    const tokenExpiry = 60;
    const options = {
      secret: tokenSecret,
      expiresIn: `${tokenExpiry}s`,
    } satisfies JwtSignOptions;

    const token = this.jwt.sign(payload, options);

    return {
      name: 'Authentication',
      value: token,
      options: {
        maxAge: tokenExpiry * 1000,
      },
    };
  }

  async createRefreshToken(agentId: UUID, oldSessionId?: UUID) {
    const agent = await this.db
      .selectFrom('agent')
      .select('agent.agentId')
      .where('agent.agentId', '=', agentId)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: `Agent doesn't exist`,
        code: 'AGENT_DOESNT_EXIST',
      });
    }

    try {
      const session = await this.db.transaction().execute(async (tx) => {
        if (oldSessionId) {
          await tx
            .deleteFrom('agentSession')
            .where('agentSession.sessionId', '=', oldSessionId)
            .execute();
        }

        return await tx
          .insertInto('agentSession')
          .values({
            agentId,
            createdBy: agentId,
          })
          .returning('agentSession.sessionId')
          .executeTakeFirst();
      });

      const shortAgentId = this.util.shortenUUID(agentId);
      const shortSessionId = this.util.shortenUUID(session.sessionId);

      const payload = {
        sub: shortAgentId,
        session_id: shortSessionId,
      } satisfies AgentRefreshJWT;

      const tokenSecret = this.config.getJWTRefreshSecret;
      const tokenExpiry = 604800; // 7 Days
      const options = {
        secret: tokenSecret,
        expiresIn: `${tokenExpiry}s`,
      } satisfies JwtSignOptions;

      const token = this.jwt.sign(payload, options);

      return {
        name: 'Refresh',
        value: token,
        options: {
          maxAge: tokenExpiry * 1000,
        },
      };
    } catch (err) {
      throw new BadRequestException({
        message: 'Unable to create session token',
        code: 'CANNOT_CREATE_SESSION_TOKEN',
      });
    }
  }
}

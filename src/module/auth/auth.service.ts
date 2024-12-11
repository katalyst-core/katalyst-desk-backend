import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UUID } from 'crypto';
import { CookieOptions } from 'express';
import * as bcrypt from 'bcrypt';

import { Database } from '@database/database';
import { ApiConfigService } from '@config/api-config.service';
import { generateUUID, restoreUUID, sendEmail, shortenUUID } from '@util/.';

import { NewAgentDTO } from './dto/new-agent-dto';
import {
  AgentAccessJWT,
  AgentEmailVerification,
  AgentGatewayJWT,
  AgentRefreshJWT,
  AgentResetPassword,
} from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: Database,
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

      const tokenPrivateKey = this.config.getJWTAccessPrivateKey;
      const FRONTEND_URL = this.config.getAppFrontendURL;

      const payload = {
        sub: shortenUUID(agent.agentId),
        action: 'verify-email',
      } satisfies AgentEmailVerification;

      const options = {
        algorithm: 'RS256',
        privateKey: tokenPrivateKey,
        expiresIn: `86400s`, // 24 Hours
      } satisfies JwtSignOptions;

      const token = this.jwt.sign(payload, options);

      await sendEmail(
        this.config.getResendAPIKey,
        email,
        'Email Verification',
        'verify-email',
        {
          FRONTEND_URL,
          EMAIL_VERIFICATION_URL: `${FRONTEND_URL}/auth/verify?token=${token}`,
        },
      );
    });
  }

  async isEmailVerified(agentId: UUID) {
    const agent = await this.db
      .selectFrom('agent')
      .select(['agent.agentId'])
      .where('agent.agentId', '=', agentId)
      .where('agent.isEmailVerified', '=', true)
      .executeTakeFirst();

    if (!agent) {
      throw new UnauthorizedException({
        message: 'Email address is not verified',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
  }

  async verifyEmail(token: string) {
    const tokenPrivateKey = this.config.getJWTAccessPrivateKey;

    const jwtToken = await this.jwt
      .verifyAsync(token, {
        secret: tokenPrivateKey,
      })
      .catch(() => {
        throw new BadRequestException({
          message: 'Invalid Token',
          code: 'INVALID_TOKEN',
        });
      });

    if (!jwtToken || !(jwtToken satisfies AgentEmailVerification)) {
      throw new BadRequestException({
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    const agentId = restoreUUID(jwtToken.sub);

    const agent = await this.db
      .selectFrom('agent')
      .select(['agent.agentId'])
      .where('agent.agentId', '=', agentId)
      .where('agent.isEmailVerified', '=', false)
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: 'Email is already verified',
        code: 'EMAIL_ALREADY_VERIFIED',
      });
    }

    await this.db
      .updateTable('agent')
      .set({
        isEmailVerified: true,
      })
      .where('agent.agentId', '=', agentId)
      .execute();
  }

  createAccessToken(agentId: UUID) {
    const shortAgentId = shortenUUID(agentId);

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

    const newSessionToken = generateUUID();

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

      const shortAgentId = shortenUUID(agentId);
      const shortSessionToken = shortenUUID(newSessionToken);

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
      const agentId = restoreUUID(shortAgentId);
      const sessionToken = restoreUUID(shortSessionToken);

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
    const shortAgentId = shortenUUID(agentId);

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

  async requestForgetPassword(email: string) {
    const agent = await this.db
      .selectFrom('agent')
      .select(['agent.agentId'])
      .where('agent.email', '=', email)
      .executeTakeFirst();

    if (!agent) return;

    const tokenPrivateKey = this.config.getJWTAccessPrivateKey;
    const FRONTEND_URL = this.config.getAppFrontendURL;

    const payload = {
      sub: shortenUUID(agent.agentId),
      action: 'reset-password',
    } satisfies AgentResetPassword;

    const options = {
      algorithm: 'RS256',
      privateKey: tokenPrivateKey,
      expiresIn: `86400s`, // 24 Hours
    } satisfies JwtSignOptions;

    const token = this.jwt.sign(payload, options);

    await sendEmail(
      this.config.getResendAPIKey,
      email,
      'Reset Password',
      'reset-password',
      {
        FRONTEND_URL,
        RESET_PASSWORD_URL: `${FRONTEND_URL}/auth/reset-password?token=${token}`,
      },
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenPrivateKey = this.config.getJWTAccessPrivateKey;

    const jwtToken = await this.jwt
      .verifyAsync(token, {
        secret: tokenPrivateKey,
      })
      .catch(() => {
        throw new BadRequestException({
          message: 'Invalid Token',
          code: 'INVALID_TOKEN',
        });
      });

    if (!jwtToken || !(jwtToken satisfies AgentResetPassword)) {
      throw new BadRequestException({
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    const agentId = restoreUUID(jwtToken.sub);

    const agent = await this.db
      .selectFrom('agentAuth')
      .select(['agentAuth.agentId'])
      .where('agentAuth.agentId', '=', agentId)
      .where('agentAuth.authType', '=', 'basic')
      .executeTakeFirst();

    if (!agent) {
      throw new BadRequestException({
        message: 'Unable to find account',
        code: 'CANNOT_FIND_ACCOUNT',
      });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.db
      .updateTable('agentAuth')
      .set({
        authValue: passwordHash,
      })
      .where('agentAuth.agentId', '=', agentId)
      .where('agentAuth.authType', '=', 'basic')
      .execute();
  }
}

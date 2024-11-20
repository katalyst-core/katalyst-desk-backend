import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { restoreUUID } from '@util/.';
import { AgentGatewayJWT } from '@module/auth/auth.type';
import { ApiConfigService } from '@config/api-config.service';

@Injectable()
export class WebsocketService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ApiConfigService,
  ) {}

  get gatewayAuth() {
    return (socket, next) => {
      try {
        const authHeader: string | undefined =
          socket.handshake.query.authorization;

        if (!authHeader) {
          throw new Error();
        }

        const token = authHeader.split(' ')[1];
        const privateKey = this.config.getJWTGatewayPrivateKey as string;

        const isTokenValid = this.jwt.verify(token, {
          secret: privateKey,
        });

        if (!isTokenValid) {
          throw new Error();
        }

        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    };
  }

  getAgentId(client: Socket) {
    try {
      const authHeader = client.handshake.query.authorization as string;

      if (!authHeader) {
        throw new Error();
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error();
      }

      const privateKey = this.config.getJWTGatewayPrivateKey;
      const content: AgentGatewayJWT = this.jwt.verify(token, {
        secret: privateKey,
        ignoreExpiration: true,
      });
      if (!content) {
        throw new Error();
      }

      const { sub: shortAgentId } = content;
      const agentId = restoreUUID(shortAgentId);

      return agentId;
    } catch (err) {
      console.log(err);
      client.disconnect();
      throw new WsException('Unauthorized');
    }
  }
}

import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WebsocketService } from './websocket.service';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({
  cors: {
    origin: ['*'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class WebsocketGateway extends BaseGateway {
  constructor(private readonly wsService: WebsocketService) {
    super();
  }

  @WebSocketServer()
  server: Server;

  async afterInit(@ConnectedSocket() socket: Socket) {
    const GatewayAuth = this.wsService.gatewayAuth;
    socket.use(GatewayAuth);
  }

  handleConnection(client: Socket) {
    console.log(`Client id: ${client.id} connected`);

    const agentId = this.wsService.getAgentId(client);

    client.join(`agent_${agentId}`);
    console.log(`agent_${agentId}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client id: ${client.id} disconnected`);
  }
}

import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BaseGateway } from 'src/websocket/base.gateway';

@WebSocketGateway()
export class ChannelGateway extends BaseGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  onEvent(): number {
    return 1;
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { BaseGateway } from '@websocket/base.gateway';

import { TicketService } from './ticket.service';
import { WsReadMessagesDTO } from './dto/ws-read-messages-dto';
import { WebsocketService } from 'src/websocket/websocket.service';

@WebSocketGateway()
export class TicketGateway extends BaseGateway {
  constructor(
    private readonly ticketService: TicketService,
    private readonly wsService: WebsocketService,
  ) {
    super();
  }

  @SubscribeMessage('ticket:read-message')
  async readMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: WsReadMessagesDTO,
  ) {
    const agentId = this.wsService.getAgentId(client);
    const { ticket_id: ticketId } = data;

    await this.ticketService.readTicketMessages(ticketId, agentId);
  }
}

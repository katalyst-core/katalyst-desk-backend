import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { BaseGateway } from 'src/websocket/base.gateway';
import { WsReadMessagesDTO } from './dto/ws-read-messages-dto';
import { TicketService } from './ticket.service';
import { WebsocketService } from 'src/websocket/websocket.service';
import { Socket } from 'socket.io';

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

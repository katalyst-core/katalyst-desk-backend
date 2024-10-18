import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { TicketService } from './ticket.service';
import { AgentJWTAccess } from '../agent/strategy/agent-jwt-access.strategy';
import { UtilService } from 'src/util/util.service';
import { AgentAccess } from '../agent/agent.type';
import { MessagesResponseDTO } from './dto/messages-response';

@UseGuards(AgentJWTAccess)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('/:id/messages')
  async getMessages(@Req() req: Request, @Param('id') ticketShortId: string) {
    const ticketId = UtilService.restoreUUID(ticketShortId);

    const user = req.user as AgentAccess;
    const { agentId } = user;

    const messages = await this.ticketService.getMessagesByTicketId(
      ticketId,
      agentId,
    );

    return {
      options: {
        dto: MessagesResponseDTO,
      },
      message: 'Successfully retrieved messages',
      data: messages,
    };
  }

  @Post('/:id/read-messages')
  async readMessages(@Req() req: Request, @Param('id') ticketShortId: string) {
    const ticketId = UtilService.restoreUUID(ticketShortId);

    const user = req.user as AgentAccess;
    const { agentId } = user;

    await this.ticketService.readTicketMessages(ticketId, agentId);

    return {
      message: 'Successfully read messages',
    };
  }
}

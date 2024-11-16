import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UUID } from 'crypto';

import { PermGuard } from '@decorator/route';
import { Agent, ParamUUID } from '@decorator/param';
import { TableOptionsDTO } from '@util/dto/table-options-dto';

import { AgentAccess } from '../auth/auth.type';
import { TicketService } from './ticket.service';
import { UtilService } from 'src/util/util.service';
import { SendMessageDTO } from './dto/send-message-dto';
import { JWTAccess } from '../auth/strategy/jwt-access.strategy';
import { MessagesResponseDTO } from './dto/messages-response-dto';
import { TicketDetailsResponseDTO } from './dto/ticket-details-response-dto';

@UseGuards(JWTAccess)
@Controller('/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @PermGuard('message.list')
  @Get('/:ticketId/messages')
  async getMessages(
    @ParamUUID('ticketId') ticketId: UUID,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const messages = await this.ticketService.getMessagesByTicketId(
      ticketId,
      tableOptions,
    );

    return {
      options: {
        dto: MessagesResponseDTO,
      },
      message: 'Successfully retrieved messages',
      data: messages,
    };
  }

  //TODO: Replace this later with read on agent send message
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

  @PermGuard('ticket.message.send')
  @Post('/:ticketId/send-message')
  async sendMessage(
    @Agent() agentId: UUID,
    @ParamUUID('ticketId') ticketId: UUID,
    @Body() data: SendMessageDTO,
  ) {
    const { text } = data;
    await this.ticketService.sendMessage(ticketId, agentId, text);

    return {
      code: 200,
      message: 'Successfully sent message',
    };
  }

  @PermGuard('ticket.detail')
  @Get('/:ticketId/details')
  async getTicketDetails(@ParamUUID('ticketId') ticketId: UUID) {
    const ticket = await this.ticketService.getTicketDetails(ticketId);

    return {
      code: 200,
      message: 'Successfully retrieved ticket details',
      data: ticket,
      options: {
        dto: TicketDetailsResponseDTO,
      },
    };
  }

  @PermGuard('ticket.close')
  @Get('/:ticketId/close')
  async closeTicket(@ParamUUID('ticketId') ticketId: UUID) {
    await this.ticketService.closeTicket(ticketId);

    return {
      code: 200,
      message: 'Successfully closed ticket',
    };
  }
}

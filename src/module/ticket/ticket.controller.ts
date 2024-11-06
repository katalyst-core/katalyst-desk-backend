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

import { TicketService } from './ticket.service';
import { JWTAccess } from '../auth/strategy/jwt-access.strategy';
import { UtilService } from 'src/util/util.service';
import { AgentAccess } from '../auth/auth.type';
import { MessagesResponseDTO } from './dto/messages-response';
import { TableOptionsDTO } from 'src/util/dto/table-options-dto';
import { SendMessageDTO } from './dto/send-message-dto';
import { UUID } from 'crypto';
import { Agent, ParamUUID } from 'src/common/decorator/param';
import { TicketDetailsResponseDTO } from './dto/ticket-details-response';

@UseGuards(JWTAccess)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('/:id/messages')
  async getMessages(
    @Req() req: Request,
    @Param('id') ticketShortId: string,
    @Query() tableOptions: TableOptionsDTO,
  ) {
    const ticketId = UtilService.restoreUUID(ticketShortId);

    const user = req.user as AgentAccess;
    const { agentId } = user;

    const messages = await this.ticketService.getMessagesByTicketId(
      ticketId,
      agentId,
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

  @Post('/:id/send-message')
  async sendMessage(
    @Req() req: Request,
    @Param('id') ticketShortId: string,
    @Body() data: SendMessageDTO,
  ) {
    const ticketId = UtilService.restoreUUID(ticketShortId);
    const { text } = data;

    const user = req.user as AgentAccess;
    const { agentId } = user;

    await this.ticketService.sendMessage(ticketId, agentId, text);

    return {
      code: 200,
      message: 'Successfully sent message',
    };
  }

  @Get('/:id/details')
  async getTicketDetails(
    @Agent() agentId: UUID,
    @ParamUUID('id') ticketId: UUID,
  ) {
    await this.ticketService.hasAccessToTicket(ticketId, agentId);
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

  @Get('/:id/close')
  async closeTicket(@Agent() agentId: UUID, @ParamUUID('id') ticketId: UUID) {
    await this.ticketService.hasAccessToTicket(ticketId, agentId);
    await this.ticketService.closeTicket(ticketId);

    return {
      code: 200,
      message: 'Successfully closed ticket',
    };
  }
}

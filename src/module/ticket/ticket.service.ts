import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Database } from 'src/database/database';
import { TableOptionsDTO } from 'src/util/dto/table-options-dto';
import { UtilService } from 'src/util/util.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly db: Database,
    private readonly util: UtilService,
  ) {}

  async getMessagesByTicketId(
    ticketId: UUID,
    userId: UUID,
    tableOptions: TableOptionsDTO,
  ) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'ticket.organizationId',
      )
      .innerJoin(
        'organizationAgent',
        'organizationAgent.organizationId',
        'organization.organizationId',
      )
      .where('organizationAgent.agentId', '=', userId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Agent does not have access to this ticket',
        code: 'AGENT_INVALID_ACCESS',
      });
    }

    const messages = this.db
      .selectFrom('ticketMessage')
      .select([
        'ticketMessage.messageId',
        'ticketMessage.messageContent',
        'ticketMessage.isCustomer',
        'ticketMessage.isRead',
        'ticketMessage.createdAt',
      ])
      .where('ticketMessage.ticketId', '=', ticketId)
      .orderBy('ticketMessage.createdAt', 'desc');

    const data = await this.util.executeWithTableOptions(
      messages,
      tableOptions,
    );

    return data;
  }

  async readTicketMessages(ticketId: UUID, userId: UUID) {
    const ticket = await this.db
      .selectFrom('ticket')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'ticket.organizationId',
      )
      .innerJoin(
        'organizationAgent',
        'organizationAgent.organizationId',
        'organization.organizationId',
      )
      .where('organizationAgent.agentId', '=', userId)
      .where('ticket.ticketId', '=', ticketId)
      .executeTakeFirst();

    if (!ticket) {
      throw new BadRequestException({
        message: 'Agent does not have access to this ticket',
        code: 'AGENT_INVALID_ACCESS',
      });
    }

    await this.db
      .updateTable('ticketMessage')
      .set({ isRead: true })
      .where('ticketMessage.isRead', '=', false)
      .where('ticketMessage.ticketId', '=', ticketId)
      .execute();
  }

  // TODO: Read messages in WhatsApp (if on whatsapp)
}

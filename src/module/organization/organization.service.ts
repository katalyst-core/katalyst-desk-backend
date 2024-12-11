import { BadRequestException, Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { Database } from '@database/database';

import { defaultRoles } from '@guard/permissions';
import { toBinary } from '@util/index';
import { ChannelGateway } from '@module/channel/channel.gateway';
import { WsTypes } from '@websocket/websocket.type';
import { ResponseDTO } from '@dto/response-dto';

import { NewOrganizationDTO } from './dto/new-organization-dto';
import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly db: Database,
    private readonly gateway: ChannelGateway,
  ) {}

  async createOrganization(agentId: UUID, data: NewOrganizationDTO) {
    return this.db.transaction().execute(async (tx) => {
      const { name } = data;

      const newOrganization = await tx
        .insertInto('organization')
        .values({
          name,
          createdBy: agentId,
        })
        .returning(['organizationId'])
        .executeTakeFirst();

      const { organizationId } = newOrganization;

      defaultRoles.forEach(async (role) => {
        await tx
          .insertInto('role')
          .values({
            roleName: role.name,
            permission: toBinary(role.permissions),
            isDefault: role.isDefault,
            organizationId,
          })
          .execute();
      });

      await tx
        .insertInto('organizationAgent')
        .values({
          organizationId,
          agentId,
          isOwner: true,
        })
        .execute();

      return newOrganization;
    });
  }

  async getOrganizationsByAgentId(agentId: UUID) {
    return await this.db
      .selectFrom('organizationAgent')
      .innerJoin(
        'organization',
        'organization.organizationId',
        'organizationAgent.organizationId',
      )
      .select(['organizationAgent.organizationId', 'organization.name'])
      .where('organizationAgent.agentId', '=', agentId)
      .execute();
  }

  async getOrganizationById(orgId: UUID) {
    const org = await this.db
      .selectFrom('organization')
      .select(['organization.organizationId', 'organization.name'])
      .where('organization.organizationId', '=', orgId)
      .executeTakeFirst();

    if (!org) {
      throw new BadRequestException({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    return org;
  }

  async sendGatewayMessage<T extends ResponseDTO = any>(
    orgId: UUID,
    type: WsTypes,
    data: T,
    dto?: { new (...args: any[]): T },
  ) {
    const orgs = await this.db
      .selectFrom('organizationAgent')
      .select(['organizationAgent.agentId'])
      .where('organizationAgent.organizationId', '=', orgId)
      .execute();

    orgs.forEach((org) => {
      this.gateway.sendAgent(org.agentId, type, data, dto);
    });
  }

  async getDashboardDetails(orgId: UUID, month: number, year: number) {
    const dashboard = await this.db
      .selectNoFrom(({ selectFrom }) => [
        selectFrom('ticket')
          .select(({ fn }) => [
            fn.count<number>('ticket.ticketId').as('ticketCount'),
          ])
          .where('organizationId', '=', orgId)
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(MONTH FROM ${ref('ticket.createdAt')})`,
            '=',
            month,
          )
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(YEAR FROM ${ref('ticket.createdAt')})`,
            '=',
            year,
          )
          .as('tickets'),
        selectFrom('ticketMessage')
          .innerJoin('ticket', 'ticket.ticketId', 'ticketMessage.ticketId')
          .select(({ fn }) => [
            fn.count<number>('ticket.ticketId').as('ticketCount'),
          ])
          .where('organizationId', '=', orgId)
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(MONTH FROM ${ref('ticket.createdAt')})`,
            '=',
            month,
          )
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(YEAR FROM ${ref('ticket.createdAt')})`,
            '=',
            year,
          )
          .as('messages'),
        selectFrom('ticket')
          .select(({ fn, ref }) => [
            fn
              .avg(
                sql<number>`EXTRACT(EPOCH FROM (${ref('ticket.updatedAt')} - ${ref('ticket.createdAt')}))`,
              )
              .as('average'),
          ])
          .where('organizationId', '=', orgId)
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(MONTH FROM ${ref('ticket.createdAt')})`,
            '=',
            month,
          )
          .where(
            ({ ref }) =>
              sql<number>`EXTRACT(YEAR FROM ${ref('ticket.createdAt')})`,
            '=',
            year,
          )
          .as('ticketResolution'),

        this.db
          .with('response_times', (qb) =>
            qb
              .selectFrom('ticketMessage')
              .innerJoin('ticket', 'ticket.ticketId', 'ticketMessage.ticketId')
              .select(({ ref }) => [
                'ticket.organizationId as organizationId',
                sql`EXTRACT(EPOCH FROM (LEAD(${ref('ticketMessage.createdAt')}) OVER (PARTITION BY ${ref('ticketMessage.ticketId')} ORDER BY ${ref('ticketMessage.createdAt')}) - ${ref('ticketMessage.createdAt')}))`.as(
                  'response_time_seconds',
                ),
              ])
              .where('ticketMessage.isCustomer', '=', true)
              .where(
                ({ ref }) =>
                  sql<number>`EXTRACT(MONTH FROM ${ref('ticket.createdAt')})`,
                '=',
                month,
              )
              .where(
                ({ ref }) =>
                  sql<number>`EXTRACT(YEAR FROM ${ref('ticket.createdAt')})`,
                '=',
                year,
              ),
          )
          .selectFrom('response_times')
          .select(({ ref }) => [
            sql`AVG(${ref('response_time_seconds')})`.as(
              'avg_response_time_seconds',
            ),
          ])
          .groupBy('organizationId')
          .as('response_time'),
        jsonArrayFrom(
          selectFrom('ticket')
            .innerJoin('channel', 'channel.channelId', 'ticket.channelId')
            .select(({ ref }) => [
              sql`DATE_TRUNC('month', ${ref('ticket.createdAt')})`.as('date'),
              sql`SUM(CASE WHEN ${ref('channel.channelType')} = 'instagram' THEN 1 ELSE 0 END)`.as(
                'instagram',
              ),
              sql`SUM(CASE WHEN ${ref('channel.channelType')} = 'whatsapp' THEN 1 ELSE 0 END)`.as(
                'whatsapp',
              ),
            ])
            .where('channel.channelType', 'in', ['whatsapp', 'instagram'])
            .groupBy('date')
            .orderBy('date'),
        ).as('ticket_time'),
        jsonArrayFrom(
          selectFrom('ticket')
            .innerJoin(
              'ticketStatus',
              'ticketStatus.status_id',
              'ticket.ticketStatus',
            )
            .select(({ fn }) => [
              'ticketStatus.status_id as status',
              fn.count<number>('ticket.ticketId').as('count'),
            ])
            .groupBy('ticketStatus.status_id'),
        ).as('ticket_status'),
      ])
      .executeTakeFirst();

    return dashboard;
  }
}

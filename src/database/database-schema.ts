import {
  pgTable,
  varchar,
  uuid,
  boolean,
  primaryKey,
  foreignKey,
  timestamp,
  text,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';

const AuditFields = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

export const authType = pgTable(
  'auth_type',
  {
    typeId: varchar('type_id').notNull(),
  },
  (t) => [primaryKey({ name: 'pk_auth_type', columns: [t.typeId] })],
);

export const channelType = pgTable(
  'channel_type',
  {
    typeId: varchar('type_id').notNull(),
  },
  (t) => [primaryKey({ name: 'pk_channel_type', columns: [t.typeId] })],
);

export const ticketStatus = pgTable(
  'ticket_status',
  {
    statusId: varchar('status_id').notNull(),
  },
  (t) => [primaryKey({ name: 'pk_ticket_status', columns: [t.statusId] })],
);

export const messageStatus = pgTable(
  'message_status',
  {
    statusId: varchar('status_id').notNull(),
  },
  (t) => [primaryKey({ name: 'pk_message_status', columns: [t.statusId] })],
);

export const agent = pgTable(
  'agent',
  {
    agentId: uuid('agent_id').notNull().defaultRandom(),
    name: varchar('name'),
    email: varchar('email'),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    ...AuditFields,
  },
  (t) => [primaryKey({ name: 'pk_agent', columns: [t.agentId] })],
);

export const agentAuth = pgTable(
  'agent_auth',
  {
    agentId: uuid('agent_id').notNull(),
    authType: varchar('auth_type').notNull(),
    authValue: varchar('auth_value').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_agent_auth', columns: [t.agentId, t.authType] }),
    foreignKey({
      name: 'fk_agent_id',
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_auth_type',
      columns: [t.authType],
      foreignColumns: [authType.typeId],
    }).onDelete('restrict'),
  ],
);

export const agentSession = pgTable(
  'agent_session',
  {
    sessionId: uuid('session_id').notNull().defaultRandom(),
    agentId: uuid('agent_id').notNull(),
    sessionToken: uuid('session_token').notNull().unique(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_agent_session', columns: [t.sessionId] }),
    foreignKey({
      name: 'fk_agent_id',
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
  ],
);

export const organization = pgTable(
  'organization',
  {
    organizationId: uuid('organization_id').notNull().defaultRandom(),
    ownerId: uuid('owner_id'),
    name: varchar('name').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_organization', columns: [t.organizationId] }),
    foreignKey({
      name: 'fk_owner_id',
      columns: [t.ownerId],
      foreignColumns: [agent.agentId],
    }).onDelete('set null'),
  ],
);

export const organizationAgent = pgTable(
  'organization_agent',
  {
    organizationId: uuid('organization_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({
      name: 'pk_organization_agent',
      columns: [t.organizationId, t.agentId],
    }),
    foreignKey({
      name: 'fk_organization_id',
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
  ],
);

export const team = pgTable(
  'team',
  {
    teamId: uuid('team_id').notNull().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    name: varchar('name').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_team', columns: [t.teamId] }),
    foreignKey({
      name: 'fk_organization_id',
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
  ],
);

export const teamAgent = pgTable(
  'team_agent',
  {
    teamId: uuid('team_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_team_agent', columns: [t.teamId, t.agentId] }),
    foreignKey({
      name: 'fk_team_id',
      columns: [t.teamId],
      foreignColumns: [team.teamId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_agent_id',
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
  ],
);

export const masterCustomer = pgTable(
  'master_customer',
  {
    masterCustomerId: uuid('master_customer_id').notNull().defaultRandom(),
    customerName: varchar('customer_name'),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_master_customer', columns: [t.masterCustomerId] }),
  ],
);

export const channelCustomer = pgTable(
  'channel_customer',
  {
    channelCustomerId: uuid('channel_customer_id').notNull().defaultRandom(),
    masterCustomerId: uuid('master_customer_id').notNull(),
    customerAccount: varchar('customer_account').notNull(),
    channelType: varchar('channel_type').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_channel_customer', columns: [t.channelCustomerId] }),
    foreignKey({
      name: 'fk_master_customer_id',
      columns: [t.masterCustomerId],
      foreignColumns: [masterCustomer.masterCustomerId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_channel_type',
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }).onDelete('restrict'),
  ],
);

export const ticket = pgTable(
  'ticket',
  {
    ticketId: uuid('ticket_id').notNull().defaultRandom(),
    ticketCode: varchar('ticket_code').notNull(),
    organizationId: uuid('organization_id').notNull(),
    // teamId: uuid('team_id'), // Separate table
    // agentId: uuid('agent_id'), // Separate table
    channelId: uuid('channel_id').notNull(),
    channelCustomerId: uuid('channel_customer_id').notNull(),
    ticketStatus: varchar('ticket_status').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_ticket', columns: [t.ticketId] }),
    foreignKey({
      name: 'fk_organization_id',
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_channel_id',
      columns: [t.channelId],
      foreignColumns: [channel.channelId],
    }).onDelete('set null'),
    foreignKey({
      name: 'fk_channel_customer_id',
      columns: [t.channelCustomerId],
      foreignColumns: [channelCustomer.channelCustomerId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_ticket_status',
      columns: [t.ticketStatus],
      foreignColumns: [ticketStatus.statusId],
    }).onDelete('restrict'),
  ],
);

export const ticketMessage = pgTable(
  'ticket_message',
  {
    messageId: uuid('message_id').notNull().defaultRandom(),
    ticketId: uuid('ticket_id').notNull(),
    agentId: uuid('agent_id'),
    messageCode: varchar('message_code'),
    isCustomer: boolean('is_customer').notNull().default(false),
    messageContent: text('message_content').notNull(),
    messageStatus: varchar('message_status'),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_ticket_message', columns: [t.messageId] }),
    foreignKey({
      name: 'fk_ticket_id',
      columns: [t.ticketId],
      foreignColumns: [ticket.ticketId],
    }),
    foreignKey({
      name: 'fk_agent_id',
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('set null'),
    foreignKey({
      name: 'fk_message_status',
      columns: [t.messageStatus],
      foreignColumns: [messageStatus.statusId],
    }).onDelete('restrict'),
    unique('u_ticket_message_message_code')
      .on(t.messageCode)
      .nullsNotDistinct(),
  ],
);

export const channel = pgTable(
  'channel',
  {
    channelId: uuid('channel_id').notNull().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    channelAuthId: uuid('channel_auth_id').notNull(),
    channelType: varchar('channel_type').notNull(),
    channelName: varchar('channel_name'),
    channelAccount: varchar('channel_account').notNull(),
    channelConfig: jsonb('channel_config'),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_channel', columns: [t.channelId] }),
    foreignKey({
      name: 'fk_organization_id',
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_channel_auth_id',
      columns: [t.channelAuthId],
      foreignColumns: [channelAuth.channelAuthId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_channel_type',
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }).onDelete('restrict'),
  ],
);

export const channelAuth = pgTable(
  'channel_auth',
  {
    channelAuthId: uuid('channel_auth_id').notNull().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    channelType: varchar('channel_type').notNull(),
    channelAuthName: varchar('channel_auth_name'),
    channelAuthAccount: varchar('channel_auth_account').notNull(),
    channelAuthConfig: jsonb('channel_auth_config'),
    channelAuthExpiryDate: timestamp('channel_auth_expiry_date', {
      withTimezone: true,
    }),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ name: 'pk_channel_auth', columns: [t.channelAuthId] }),
    foreignKey({
      name: 'fk_organization_id',
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_channel_type',
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }),
  ],
);

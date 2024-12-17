import {
  pgTable,
  varchar,
  uuid,
  boolean,
  primaryKey,
  foreignKey,
  timestamp,
  jsonb,
  unique,
  customType,
  bigserial,
  text,
} from 'drizzle-orm/pg-core';

const varbit = customType<{ data: number; config: { length: number } }>({
  dataType(config) {
    return config?.length ? `bit varying(${config.length})` : 'bit varying';
  },
});

const AuditFields = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

export const authType = pgTable(
  'auth_type',
  {
    typeId: varchar('type_id', { length: 24 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.typeId] })],
);

export const channelType = pgTable(
  'channel_type',
  {
    typeId: varchar('type_id', { length: 24 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.typeId] })],
);

export const ticketStatus = pgTable(
  'ticket_status',
  {
    statusId: varchar('status_id', { length: 24 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.statusId] })],
);

export const messageStatus = pgTable(
  'message_status',
  {
    statusId: varchar('status_id', { length: 24 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.statusId] })],
);

export const agent = pgTable(
  'agent',
  {
    agentId: uuid('agent_id').notNull().defaultRandom(),
    name: varchar('name', { length: 128 }).notNull(),
    email: varchar('email', { length: 320 }),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    ...AuditFields,
  },
  (t) => [primaryKey({ columns: [t.agentId] })],
);

export const agentAuth = pgTable(
  'agent_auth',
  {
    agentId: uuid('agent_id').notNull(),
    authType: varchar('auth_type', { length: 24 }).notNull(),
    authValue: varchar('auth_value', { length: 64 }).notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.agentId, t.authType] }),
    foreignKey({
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
    foreignKey({
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
    primaryKey({ columns: [t.sessionId] }),
    foreignKey({
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
  ],
);

export const organization = pgTable(
  'organization',
  {
    organizationId: uuid('organization_id').notNull().defaultRandom(),
    name: varchar('name', { length: 128 }).notNull(),
    welcomeMessage: text('welcome_message'),
    ...AuditFields,
  },
  (t) => [primaryKey({ columns: [t.organizationId] })],
);

export const organizationAgent = pgTable(
  'organization_agent',
  {
    organizationId: uuid('organization_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    isOwner: boolean('is_owner').notNull().default(false),
    ...AuditFields,
  },
  (t) => [
    primaryKey({
      columns: [t.organizationId, t.agentId],
    }),
    foreignKey({
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('cascade'),
  ],
);

export const team = pgTable(
  'team',
  {
    teamId: uuid('team_id').notNull().defaultRandom(),
    organizationId: uuid('organization_id').notNull(),
    name: varchar('name', { length: 64 }).notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.teamId] }),
    foreignKey({
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
  ],
);

export const agentTeam = pgTable(
  'agent_team',
  {
    organizationId: uuid('organization_id').notNull(),
    teamId: uuid('team_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.teamId, t.agentId] }),
    foreignKey({
      columns: [t.teamId],
      foreignColumns: [team.teamId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.agentId, t.organizationId],
      foreignColumns: [
        organizationAgent.agentId,
        organizationAgent.organizationId,
      ],
    }).onDelete('cascade'),
  ],
);

export const masterCustomer = pgTable(
  'master_customer',
  {
    masterCustomerId: uuid('master_customer_id').notNull().defaultRandom(),
    customerName: varchar('customer_name', { length: 128 }),
    ...AuditFields,
  },
  (t) => [primaryKey({ columns: [t.masterCustomerId] })],
);

export const channelCustomer = pgTable(
  'channel_customer',
  {
    channelCustomerId: uuid('channel_customer_id').notNull().defaultRandom(),
    masterCustomerId: uuid('master_customer_id').notNull(),
    customerAccount: varchar('customer_account', { length: 128 }).notNull(),
    channelType: varchar('channel_type', { length: 24 }).notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.channelCustomerId] }),
    foreignKey({
      columns: [t.masterCustomerId],
      foreignColumns: [masterCustomer.masterCustomerId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }).onDelete('restrict'),
  ],
);

export const ticket = pgTable(
  'ticket',
  {
    ticketId: uuid('ticket_id').notNull().defaultRandom(),
    ticketCode: varchar('ticket_code', { length: 24 }).notNull(),
    organizationId: uuid('organization_id').notNull(),
    channelId: uuid('channel_id'),
    channelCustomerId: uuid('channel_customer_id').notNull(),
    ticketStatus: varchar('ticket_status', { length: 24 }).notNull(),
    conversationId: varchar('conversation_id', { length: 64 }),
    conversationExpiration: timestamp('conversation_expiration', {
      withTimezone: true,
    }),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.ticketId] }),
    foreignKey({
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.channelId],
      foreignColumns: [channel.channelId],
    }).onDelete('set null'),
    foreignKey({
      columns: [t.channelCustomerId],
      foreignColumns: [channelCustomer.channelCustomerId],
    }).onDelete('cascade'),
    foreignKey({
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
    messageCode: text('message_code'),
    isCustomer: boolean('is_customer').notNull().default(false),
    messageContent: jsonb('message_content').notNull(),
    messageStatus: varchar('message_status', { length: 24 }).notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.messageId] }),
    foreignKey({
      columns: [t.ticketId],
      foreignColumns: [ticket.ticketId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.agentId],
      foreignColumns: [agent.agentId],
    }).onDelete('set null'),
    foreignKey({
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
    channelType: varchar('channel_type', { length: 24 }).notNull(),
    channelName: varchar('channel_name', { length: 128 }),
    channelParentAccount: varchar('channel_parent_account', { length: 128 }),
    channelAccount: varchar('channel_account', { length: 64 }).notNull(),
    channelConfig: jsonb('channel_config').notNull(),
    channelExpiryDate: timestamp('channel_expiry_date', { withTimezone: true }),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.channelId] }),
    foreignKey({
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }).onDelete('restrict'),
  ],
);

export const ticketAgent = pgTable(
  'ticket_agent',
  {
    ticketId: uuid('ticket_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.ticketId, t.agentId] }),
    foreignKey({
      columns: [t.ticketId],
      foreignColumns: [ticket.ticketId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.agentId, t.organizationId],
      foreignColumns: [
        organizationAgent.agentId,
        organizationAgent.organizationId,
      ],
    }).onDelete('cascade'),
  ],
);

export const ticketTeam = pgTable(
  'ticket_team',
  {
    ticketId: uuid('ticket_id').notNull(),
    teamId: uuid('team_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.ticketId, t.teamId] }),
    foreignKey({
      columns: [t.ticketId],
      foreignColumns: [ticket.ticketId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.teamId],
      foreignColumns: [team.teamId],
    }).onDelete('cascade'),
  ],
);

export const role = pgTable(
  'role',
  {
    roleId: uuid('role_id').notNull().defaultRandom(),
    roleName: varchar('role_name', { length: 64 }).notNull(),
    organizationId: uuid('organization_id').notNull(),
    permission: varbit('permission', { length: 32 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.roleId] }),
    foreignKey({
      columns: [t.organizationId],
      foreignColumns: [organization.organizationId],
    }).onDelete('cascade'),
  ],
);

export const agentRole = pgTable(
  'agent_role',
  {
    roleId: uuid('role_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.agentId, t.roleId] }),
    foreignKey({
      columns: [t.roleId],
      foreignColumns: [role.roleId],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.agentId, t.organizationId],
      foreignColumns: [
        organizationAgent.agentId,
        organizationAgent.organizationId,
      ],
    }).onDelete('cascade'),
  ],
);

export const channelEventLog = pgTable(
  'channel_event_log',
  {
    id: bigserial('id', { mode: 'bigint' }).notNull(),
    content: jsonb('content').notNull(),
    error: jsonb('error'),
    channelType: varchar('channel_type', { length: 24 }).notNull(),
    isProcessed: boolean('is_processed').notNull(),
    ...AuditFields,
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    foreignKey({
      columns: [t.channelType],
      foreignColumns: [channelType.typeId],
    }),
  ],
);

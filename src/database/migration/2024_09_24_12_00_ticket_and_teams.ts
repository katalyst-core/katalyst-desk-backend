import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('channel_type')
    .addColumn('type_id', 'varchar', (col) => col.notNull())
    .addColumn('channel_name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_channel_type', ['type_id'])
    .execute();

  await db
    .insertInto('channel_type')
    .values([
      {
        type_id: 'whatsapp',
        channel_name: 'WhatsApp',
      },
      {
        type_id: 'line',
        channel_name: 'LINE',
      },
    ])
    .execute();

  await db.schema
    .createTable('ticket_status')
    .addColumn('status_id', 'varchar', (col) => col.notNull())
    .addColumn('status_name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_ticket_status', ['status_id'])
    .execute();

  await db
    .insertInto('ticket_status')
    .values([
      {
        status_id: 'open',
        status_name: 'Open',
      },
      {
        status_id: 'close',
        status_name: 'Close',
      },
    ])
    .execute();

  await db.schema
    .createTable('message_status')
    .addColumn('status_id', 'varchar', (col) => col.notNull())
    .addColumn('status_name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_message_status', ['status_id'])
    .execute();

  await db
    .insertInto('message_status')
    .values([
      {
        status_id: 'sent',
        status_name: 'Sent',
      },
      {
        status_id: 'received',
        status_name: 'Received',
      },
      {
        status_id: 'read',
        status_name: 'Read',
      },
    ])
    .execute();

  await db.schema
    .createTable('team')
    .addColumn('team_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_team', ['team_id'])
    .addForeignKeyConstraint(
      'fk_organization_id',
      ['organization_id'],
      'organization',
      ['organization_id'],
      (b) => b.onDelete('cascade'),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('team_agent')
    .addColumn('team_id', 'uuid', (col) => col.notNull())
    .addColumn('agent_id', 'uuid', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_team_agent', ['team_id', 'agent_id'])
    .addForeignKeyConstraint(
      'fk_team_id',
      ['team_id'],
      'team',
      ['team_id'],
      (b) => b.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'fk_agent_id',
      ['agent_id'],
      'agent',
      ['agent_id'],
      (b) => b.onDelete('cascade'),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('master_customer')
    .addColumn('master_customer_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('customer_name', 'varchar')
    .addPrimaryKeyConstraint('pk_master_customer', ['master_customer_id'])
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('channel_customer')
    .addColumn('channel_customer_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('master_customer_id', 'uuid', (col) => col.notNull())
    .addColumn('customer_account', 'varchar', (col) => col.notNull())
    .addColumn('channel_type', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_channel_customer', ['channel_customer_id'])
    .addForeignKeyConstraint(
      'fk_master_customer_id',
      ['master_customer_id'],
      'master_customer',
      ['master_customer_id'],
      (b) => b.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'fk_channel_type',
      ['channel_type'],
      'channel_type',
      ['type_id'],
      (b) => b.onDelete('no action'),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('ticket')
    .addColumn('ticket_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('ticket_code', 'varchar', (col) => col.notNull())
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('team_id', 'uuid')
    .addColumn('agent_id', 'uuid')
    .addColumn('channel_customer_id', 'uuid')
    .addColumn('ticket_status', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_ticket', ['ticket_id'])
    .addForeignKeyConstraint(
      'fk_organization_id',
      ['organization_id'],
      'organization',
      ['organization_id'],
      (b) => b.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'fk_team_id',
      ['team_id'],
      'team',
      ['team_id'],
      (b) => b.onDelete('set null'),
    )
    .addForeignKeyConstraint(
      'fk_agent_id',
      ['agent_id'],
      'agent',
      ['agent_id'],
      (b) => b.onDelete('set null'),
    )
    .addForeignKeyConstraint(
      'fk_channel_customer_id',
      ['channel_customer_id'],
      'channel_customer',
      ['channel_customer_id'],
      (b) => b.onDelete('set null'),
    )
    .addForeignKeyConstraint(
      'fk_ticket_status',
      ['ticket_status'],
      'ticket_status',
      ['status_id'],
      (b) => b.onDelete('no action'),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('ticket_message')
    .addColumn('message_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('ticket_id', 'uuid', (col) => col.notNull())
    .addColumn('agent_id', 'uuid')
    .addColumn('message_status', 'varchar')
    .addColumn('is_customer', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('message_content', 'text')
    .addPrimaryKeyConstraint('pk_ticket_message', ['message_id'])
    .addForeignKeyConstraint(
      'fk_ticket_id',
      ['ticket_id'],
      'ticket',
      ['ticket_id'],
      (b) => b.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'fk_agent_id',
      ['agent_id'],
      'agent',
      ['agent_id'],
      (b) => b.onDelete('no action'),
    )
    .addForeignKeyConstraint(
      'fk_message_status',
      ['message_status'],
      'message_status',
      ['status_id'],
      (b) => b.onDelete('no action'),
    )
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ticket_message').execute();
  await db.schema.dropTable('ticket').execute();
  await db.schema.dropTable('channel_customer').execute();
  await db.schema.dropTable('master_customer').execute();
  await db.schema.dropTable('team_agent').execute();
  await db.schema.dropTable('team').execute();
  await db.schema.dropTable('message_status').execute();
  await db.schema.dropTable('ticket_status').execute();
  await db.schema.dropTable('channel_type').execute();
}

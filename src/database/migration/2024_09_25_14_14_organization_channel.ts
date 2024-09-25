import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>) {
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
    .createTable('organization_channel')
    .addColumn('channel_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('channel_type', 'varchar', (col) => col.notNull())
    .addColumn('channel_account', 'varchar', (col) => col.notNull())
    .addColumn('channel_config', 'jsonb')
    .addPrimaryKeyConstraint('pk_organization_channel', ['channel_id'])
    .addForeignKeyConstraint(
      'fk_organization_id',
      ['organization_id'],
      'organization',
      ['organization_id'],
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
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('organization_channel').execute();
  await db.schema.dropTable('channel_type').execute();
}

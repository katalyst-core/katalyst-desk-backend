import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('channel')
    .addColumn('channel_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('channel_type', 'varchar', (col) => col.notNull())
    .addColumn('channel_name', 'varchar')
    .addColumn('channel_account', 'varchar', (col) => col.notNull())
    .addColumn('channel_config', 'jsonb')
    .addPrimaryKeyConstraint('pk_channel', ['channel_id'])
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
  await db.schema.dropTable('channel').execute();
}

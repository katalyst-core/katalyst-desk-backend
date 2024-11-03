import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('channel_auth')
    .addColumn('channel_auth_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('channel_type', 'varchar', (col) => col.notNull())
    .addColumn('channel_auth_name', 'varchar')
    .addColumn('channel_auth_account', 'varchar', (col) => col.notNull())
    .addColumn('channel_auth_config', 'jsonb', (col) => col.notNull())
    .addColumn('channel_auth_expiry_date', 'timestamptz')
    .addPrimaryKeyConstraint('pk_channel_auth', ['channel_auth_id'])
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

  await db.schema
    .alterTable('channel')
    .addColumn('channel_auth_id', 'uuid', (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable('channel')
    .addForeignKeyConstraint(
      'fk_channel_auth_id',
      ['channel_auth_id'],
      'channel_auth',
      ['channel_auth_id'],
    )
    .onDelete('cascade')
    .execute();

  await db
    .insertInto('channel_type')
    .values({ type_id: 'instagram', channel_name: 'Instagram' })
    .execute();
}

export async function down(db: Kysely<any>) {
  await db
    .deleteFrom('channel_type')
    .where('type_id', '=', 'instagram')
    .execute();

  await db.schema
    .alterTable('channel')
    .dropConstraint('fk_channel_auth_id')
    .execute();

  await db.schema.alterTable('channel').dropColumn('channel_auth_id').execute();

  await db.schema.dropTable('channel_auth').execute();
}

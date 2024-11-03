import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket')
    .addColumn('channel_id', 'uuid', (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable('ticket')
    .addForeignKeyConstraint('fk_channel_id', ['channel_id'], 'channel', [
      'channel_id',
    ])
    .onDelete('no action')
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket')
    .dropConstraint('fk_channel_id')
    .execute();

  await db.schema.alterTable('ticket').dropColumn('channel_id').execute();
}

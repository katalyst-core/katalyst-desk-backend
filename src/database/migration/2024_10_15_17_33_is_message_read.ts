import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_message')
    .addColumn('is_read', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('ticket_message').dropColumn('is_read').execute();
}

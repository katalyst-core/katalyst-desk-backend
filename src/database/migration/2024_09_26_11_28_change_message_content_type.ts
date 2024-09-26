import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_message')
    .dropColumn('message_content')
    .execute();

  await db.schema
    .alterTable('ticket_message')
    .addColumn('message_content', 'jsonb')
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_message')
    .dropColumn('message_content')
    .execute();

  await db.schema
    .alterTable('ticket_message')
    .addColumn('message_content', 'text')
    .execute();
}

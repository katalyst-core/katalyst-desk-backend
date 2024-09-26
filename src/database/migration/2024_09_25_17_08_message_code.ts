import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_message')
    .addColumn('message_code', 'varchar')
    .execute();

  await db.schema
    .alterTable('ticket_message')
    .addUniqueConstraint(
      'u_ticket_message_message_code',
      ['message_code'],
      (b) => b.nullsNotDistinct(),
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_message')
    .dropConstraint('u_ticket_message_message_code')
    .execute();

  await db.schema
    .alterTable('ticket_message')
    .dropColumn('message_code')
    .execute();
}

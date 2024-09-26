import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_customer')
    .renameColumn('contact_value', 'contact_account')
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket_customer')
    .renameColumn('contact_account', 'contact_value')
    .execute();
}

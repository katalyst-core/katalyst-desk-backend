import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ticket')
    .dropConstraint('fk_contact_type')
    .execute();

  await db.schema.alterTable('ticket').dropColumn('contact_type').execute();

  await db.schema
    .alterTable('ticket_customer')
    .dropConstraint('fk_contact_type')
    .execute();

  await db.schema
    .alterTable('ticket_customer')
    .dropColumn('contact_type')
    .execute();

  await db.schema.dropTable('contact_type').execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .createTable('contact_type')
    .addColumn('type_id', 'varchar', (col) => col.notNull())
    .addColumn('contact_name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_contact_type', ['type_id'])
    .execute();

  await db
    .insertInto('contact_type')
    .values([
      {
        type_id: 'whatsapp',
        contact_name: 'WhatsApp',
      },
      {
        type_id: 'line',
        contact_name: 'LINE',
      },
    ])
    .execute();

  await db.schema
    .alterTable('ticket_customer')
    .addColumn('contact_type', 'varchar', (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable('ticket_customer')
    .addForeignKeyConstraint(
      'fk_contact_type',
      ['contact_type'],
      'contact_type',
      ['type_id'],
    )
    .onDelete('no action')
    .execute();

  await db.schema
    .alterTable('ticket')
    .addColumn('contact_type', 'varchar', (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable('ticket')
    .addForeignKeyConstraint(
      'fk_contact_type',
      ['contact_type'],
      'contact_type',
      ['type_id'],
    )
    .onDelete('no action')
    .execute();
}

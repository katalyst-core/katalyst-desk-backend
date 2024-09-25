import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('organization')
    .dropConstraint('fk_owner_id')
    .execute();

  await db.schema
    .alterTable('organization')
    .addForeignKeyConstraint('fk_owner_id', ['owner_id'], 'agent', ['agent_id'])
    .onDelete('set null')
    .execute();

  await db.schema
    .alterTable('agent_auth')
    .dropConstraint('fk_auth_type')
    .execute();

  await db.schema
    .alterTable('agent_auth')
    .addForeignKeyConstraint('fk_auth_type', ['auth_type'], 'auth_type', [
      'type_id',
    ])
    .onDelete('no action')
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('organization')
    .dropConstraint('fk_owner_id')
    .execute();

  await db.schema
    .alterTable('organization')
    .addForeignKeyConstraint('fk_owner_id', ['owner_id'], 'agent', ['agent_id'])
    .onDelete('no action')
    .execute();

  await db.schema
    .alterTable('agent_auth')
    .dropConstraint('fk_auth_type')
    .execute();

  await db.schema
    .alterTable('agent_auth')
    .addForeignKeyConstraint('fk_auth_type', ['auth_type'], 'auth_type', [
      'type_id',
    ])
    .onDelete('cascade')
    .execute();
}

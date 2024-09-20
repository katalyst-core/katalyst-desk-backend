import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('auth_type')
    .addColumn('type_id', 'varchar', (col) => col.notNull())
    .addColumn('auth_name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk', ['type_id'])
    .execute();

  await db
    .insertInto('auth_type')
    .values([
      {
        type_id: 'basic',
        auth_name: 'Username and Password',
      },
    ])
    .execute();

  await db.schema
    .createTable('agent')
    .addColumn('agent_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('is_email_verified', 'boolean', (col) =>
      col.defaultTo(false).notNull(),
    )
    .addPrimaryKeyConstraint('pk', ['agent_id'])
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('agent_auth')
    .addColumn('agent_id', 'uuid', (col) => col.notNull())
    .addColumn('auth_type', 'varchar', (col) => col.notNull())
    .addColumn('auth_value', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk', ['agent_id', 'auth_type'])
    .addForeignKeyConstraint('fk_agent_id', ['agent_id'], 'agent', ['agent_id'])
    .addForeignKeyConstraint('fk_auth_type', ['auth_type'], 'auth_type', [
      'type_id',
    ])
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('agent_session')
    .addColumn('session_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('agent_id', 'uuid', (col) =>
      col.references('agent.agent_id').notNull(),
    )
    .addPrimaryKeyConstraint('pk', ['session_id'])
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('agent_session').execute();
  await db.schema.dropTable('agent_auth').execute();
  await db.schema.dropTable('agent').execute();
  await db.schema.dropTable('auth_type').execute();
}

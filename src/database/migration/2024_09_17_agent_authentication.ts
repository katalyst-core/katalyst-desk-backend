import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('auth_type')
    .addColumn('type_id', 'varchar', (col) => col.primaryKey())
    .addColumn('auth_name', 'varchar', (col) => col.notNull())
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
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('is_email_verified', 'boolean', (col) =>
      col.defaultTo(false).notNull(),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('agent_auth')
    .addColumn('agent_id', 'uuid', (col) =>
      col.references('agent.agent_id').notNull(),
    )
    .addColumn('auth_type', 'varchar', (col) =>
      col.references('auth_type.type_id').notNull(),
    )
    .addColumn('auth_value', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('primary_key', ['agent_id', 'auth_type'])
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('agent_session')
    .addColumn('session_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('agent_id', 'uuid', (col) =>
      col.references('agent.agent_id').notNull(),
    )
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('agent_session').execute();
  await db.schema.dropTable('agent_auth').execute();
  await db.schema.dropTable('agent').execute();
  await db.schema.dropTable('auth_type').execute();
}

import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('organization')
    .addColumn('organization_id', 'uuid', (col) =>
      col.notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('owner_id', 'uuid', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_organization', ['organization_id'])
    .addForeignKeyConstraint(
      'fk_owner_id',
      ['owner_id'],
      'agent',
      ['agent_id'],
      (b) => b.onDelete('no action'),
    )
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('organization_agent')
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('agent_id', 'uuid', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_organization_agent', [
      'organization_id',
      'agent_id',
    ])
    .addForeignKeyConstraint(
      'fk_organization_id',
      ['organization_id'],
      'organization',
      ['organization_id'],
      (b) => b.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'fk_agent_id',
      ['agent_id'],
      'agent',
      ['agent_id'],
      (b) => b.onDelete('cascade'),
    )
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('organization_agent').execute();
  await db.schema.dropTable('organization').execute();
}

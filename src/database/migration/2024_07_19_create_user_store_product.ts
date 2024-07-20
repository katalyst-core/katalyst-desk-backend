import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('user_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('username', 'varchar', (col) => col.notNull().unique())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('is_email_verified', 'boolean', (col) => col.defaultTo(false))
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('basic_user_authentication')
    .addColumn('user_id', 'uuid', (col) =>
      col.primaryKey().references('user.user_id'),
    )
    .addColumn('password_hash', 'varchar', (col) => col.notNull())
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('user_session')
    .addColumn('session_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('user.user_id').notNull(),
    )
    .addColumn('session_token', 'varchar(12)')
    .addUniqueConstraint('session', ['user_id', 'session_token'])
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('store')
    .addColumn('store_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('owner_id', 'uuid', (col) =>
      col.notNull().references('user.user_id').onDelete('cascade'),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('master_product')
    .addColumn('product_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('store_id', 'uuid', (col) =>
      col.notNull().references('store.store_id').onDelete('cascade'),
    )
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('sku', 'varchar')
    .addColumn('description', 'varchar')
    .addColumn('stock', 'integer')
    .addColumn('active', 'boolean', (col) => col.defaultTo(false))
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('master_product').execute();
  await db.schema.dropTable('store').execute();
  await db.schema.dropTable('user_session').execute();
  await db.schema.dropTable('basic_user_authentication').execute();
  await db.schema.dropTable('user').execute();
}

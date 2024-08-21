import { Kysely, sql } from 'kysely';
import { withAudit } from '../model';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('product_condition')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .execute();

  await db
    .insertInto('product_condition')
    .values([
      {
        id: 'new',
      },
      {
        id: 'old',
      },
    ])
    .execute();

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
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('stock', 'integer', (col) => col.notNull())
    .addColumn('price', 'integer', (col) => col.notNull())
    .addColumn('discount_price', 'integer')
    .addColumn('discount_percentage', 'integer')
    .addColumn('weight', 'integer', (col) => col.notNull())
    .addColumn('images', sql`varchar[]`, (col) => col.notNull())
    .addColumn('videos', sql`varchar[]`)
    .addColumn('dimension_width', 'integer', (col) => col.notNull())
    .addColumn('dimension_height', 'integer', (col) => col.notNull())
    .addColumn('dimension_length', 'integer', (col) => col.notNull())
    .addColumn('brand', 'varchar')
    .addColumn('condition', 'varchar', (col) =>
      col.notNull().references('product_condition.id').onDelete('no action'),
    )
    .addColumn('preorder', 'boolean', (col) => col.defaultTo(false))
    .addColumn('preorder_duration', 'integer')
    .addColumn('variant_name', 'varchar')
    .addColumn('wholesale', 'jsonb')
    .addColumn('attribute', 'jsonb')
    .addColumn('active', 'boolean', (col) => col.defaultTo(false))
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('product_variant')
    .addColumn('variant_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('product_id', 'uuid', (col) =>
      col.notNull().references('master_product.product_id').onDelete('cascade'),
    )
    .addColumn('sku', 'varchar')
    .addColumn('weight', 'integer', (col) => col.notNull())
    .addColumn('name', 'varchar')
    .addColumn('stock', 'integer', (col) => col.notNull())
    .addColumn('images', sql`varchar[]`)
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('tokopedia_product_config')
    .addColumn('product_id', 'uuid', (col) =>
      col
        .primaryKey()
        .references('master_product.product_id')
        .onDelete('cascade'),
    )
    .addColumn('category_id', 'integer', (col) => col.notNull())
    .$call(withAudit)
    .execute();

  await db.schema
    .createTable('tokopedia_product')
    .addColumn('ext_product_id', 'integer', (col) => col.primaryKey())
    .addColumn('product_id', 'uuid', (col) =>
      col.notNull().references('master_product.product_id').onDelete('cascade'),
    )
    .$call(withAudit)
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('tokopedia_product').execute();
  await db.schema.dropTable('tokopedia_product_config').execute();
  await db.schema.dropTable('product_variant').execute();
  await db.schema.dropTable('master_product').execute();
  await db.schema.dropTable('store').execute();
  await db.schema.dropTable('user_session').execute();
  await db.schema.dropTable('basic_user_authentication').execute();
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('product_condition').execute();
}

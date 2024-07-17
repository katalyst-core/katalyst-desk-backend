import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const AuditFields = {
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  createdBy: bigint('created_by', { mode: 'number' }),
  updatedBy: bigint('updated_by', { mode: 'number' }),
};

export const PublicID = {
  publicId: varchar('public_id', { length: 16 }).notNull(),
};

export const User = pgTable('User', {
  userId: bigserial('user_id', { mode: 'number' }).primaryKey(),
  name: varchar('name').notNull(),
  username: varchar('username').unique().notNull(),
  email: varchar('email').notNull(),
  emailVerified: boolean('email_verified').default(false),
  ...AuditFields,
  ...PublicID,
});

export const BasicUserAuthentication = pgTable('BasicUserAuthentication', {
  userId: bigint('user_id', { mode: 'number' })
    .references(() => User.userId, { onDelete: 'cascade' })
    .primaryKey(),
  passwordHash: varchar('password_hash'),
  ...AuditFields,
});

export const UserSession = pgTable(
  'UserSession',
  {
    userId: bigint('user_id', { mode: 'number' }).references(
      () => User.userId,
      { onDelete: 'cascade' },
    ),
    sessionToken: varchar('session_token', { length: 16 }),
    ...AuditFields,
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.sessionToken] }),
    };
  },
);

export const Store = pgTable('Store', {
  storeId: bigserial('store_id', { mode: 'number' }).primaryKey(),
  ownerId: bigint('owner_id', { mode: 'number' }).references(
    () => User.userId,
    { onDelete: 'cascade' },
  ),
  name: varchar('name').notNull(),
  ...PublicID,
  ...AuditFields,
});

export const MasterProduct = pgTable('MasterProduct', {
  productId: bigserial('product_id', { mode: 'number' }).primaryKey(),
  storeId: bigint('store_id', { mode: 'number' }).references(
    () => Store.storeId,
    { onDelete: 'cascade' },
  ),
  name: varchar('name').notNull(),
  sku: varchar('sku'),
  description: varchar('description'),
  stock: integer('stock'),
  active: boolean('active'),
  ...PublicID,
  ...AuditFields,
});

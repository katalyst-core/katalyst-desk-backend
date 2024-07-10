import {
  bigint,
  bigserial,
  boolean,
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

export const User = pgTable('User', {
  userId: bigserial('user_id', { mode: 'number' }).primaryKey(),
  publicId: varchar('public_id', { length: 16 }).notNull(),
  name: varchar('name').notNull(),
  username: varchar('username').unique().notNull(),
  email: varchar('email').notNull(),
  emailVerified: boolean('email_verified').default(false),
  ...AuditFields,
});

export const BasicUserAuthentication = pgTable('BasicUserAuthentication', {
  userId: bigint('user_id', { mode: 'number' })
    .references(() => User.userId)
    .primaryKey(),
  passwordHash: varchar('password_hash'),
  ...AuditFields,
});

export const UserSession = pgTable(
  'UserSession',
  {
    userId: bigint('user_id', { mode: 'number' }).references(() => User.userId),
    sessionToken: varchar('session_token', { length: 16 }),
    ...AuditFields,
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.sessionToken] }),
    };
  },
);

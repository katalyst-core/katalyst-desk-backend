import {
  bigint,
  bigserial,
  boolean,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';

export const User = pgTable('User', {
  userId: bigserial('user_id', { mode: 'bigint' }).primaryKey(),
  publicId: varchar('public_id', { length: 16 }).notNull(),
  name: varchar('name').notNull(),
  username: varchar('username').notNull(),
  email: varchar('email').notNull(),
  emailVerified: boolean('email_verified').default(false),
});

export const BasicUserAuthentication = pgTable('BasicUserAuthentication', {
  userId: bigint('user_id', { mode: 'bigint' })
    .references(() => User.userId)
    .primaryKey(),
  password_hash: varchar('password_hash'),
});

export const schema = {
  User,
  BasicUserAuthentication,
};

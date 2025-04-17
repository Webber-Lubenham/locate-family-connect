import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  user_type: text('user_type').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  full_name: text('full_name').notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const schema = {
  users,
  profiles
};

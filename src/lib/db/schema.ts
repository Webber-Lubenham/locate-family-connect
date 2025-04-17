import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 20 }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const schema = {
  users
};

import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  email: varchar('email', { length: 256 }).notNull(),
  school: text('school'),
  grade: text('grade'),
  phone: varchar('phone', { length: 20 }),
  userType: text('user_type').notNull(),
});

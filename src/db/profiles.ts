import { pgTable, serial, text, varchar, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  school: text('school'),
  grade: text('grade'),
  phone: varchar('phone', { length: 20 }),
  user_type: text('user_type').notNull(),
});

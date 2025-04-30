
import { pgTable, uuid, text, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
  user_type: text('user_type').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const profiles = pgTable('profiles', {
  id: integer('id').primaryKey(),
  user_id: uuid('user_id'),
  full_name: text('full_name').notNull(),
  phone: varchar('phone', { length: 20 }),
  email: text('email').notNull(),
  user_type: text('user_type').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const guardians = pgTable('guardians', {
  id: uuid('id').primaryKey().defaultRandom(),
  student_id: uuid('student_id'),
  email: text('email').notNull(),
  full_name: text('full_name'),
  phone: text('phone'),
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull()
});

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  timestamp: timestamp('timestamp').notNull()
});

export const schema = {
  users,
  profiles,
  guardians,
  locations
};

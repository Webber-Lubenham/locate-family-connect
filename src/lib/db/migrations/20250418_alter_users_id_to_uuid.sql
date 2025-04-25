-- Migration to alter users.id from integer to UUID and update related profiles.user_id

-- Add new UUID column
ALTER TABLE users ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();

-- Update profiles.user_id to new UUIDs
ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;

-- Update profiles.user_id to match users.uuid_id
UPDATE profiles p
SET user_id = u.uuid_id
FROM users u
WHERE p.user_id::text = u.id::text;

-- Drop old primary key constraint
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Drop old id column
ALTER TABLE users DROP COLUMN id;

-- Rename uuid_id to id
ALTER TABLE users RENAME COLUMN uuid_id TO id;

-- Set id as primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Recreate foreign key constraint on profiles.user_id
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Ensure profiles.user_id is UUID type
ALTER TABLE profiles ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::uuid;

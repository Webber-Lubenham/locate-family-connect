-- Migration to fix existing tables without recreating them

-- Drop foreign key constraint on profiles.user_id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Alter profiles.user_id to UUID type
ALTER TABLE profiles ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::uuid;

-- Add foreign key constraint back
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Add email column to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='email'
    ) THEN
        ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT '';
    END IF;
END
$$;

-- Add user_type column to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='user_type'
    ) THEN
        ALTER TABLE users ADD COLUMN user_type TEXT NOT NULL DEFAULT 'student';
    END IF;
END
$$;

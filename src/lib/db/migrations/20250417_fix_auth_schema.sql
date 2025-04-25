-- Add user_type to auth.users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Add phone to auth.users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for user_type
CREATE INDEX IF NOT EXISTS idx_users_user_type ON auth.users(user_type);

-- Create index for phone
CREATE INDEX IF NOT EXISTS idx_users_phone ON auth.users(phone);

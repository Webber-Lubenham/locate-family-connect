-- Add user_type column to users table
ALTER TABLE users
ADD COLUMN user_type TEXT NOT NULL DEFAULT 'student';

-- Create index for user_type
CREATE INDEX idx_users_user_type ON users(user_type);

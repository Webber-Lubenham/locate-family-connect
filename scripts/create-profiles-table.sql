-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  school TEXT,
  grade TEXT,
  phone VARCHAR(20),
  user_type TEXT NOT NULL
);

-- Add foreign key constraint to link with auth.users
ALTER TABLE profiles
ADD CONSTRAINT fk_user_id
FOREIGN KEY (id)
REFERENCES auth.users (id)
ON DELETE CASCADE;


-- Fix Row Level Security Policies for profiles table

-- First, let's drop any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create comprehensive policies for the profiles table
CREATE POLICY "Users can view any profile" 
  ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Make sure authenticated users have proper permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

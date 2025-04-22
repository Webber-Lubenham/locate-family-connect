
-- Fix profiles table by removing phone_country column reference
ALTER TABLE profiles DROP COLUMN IF EXISTS phone_country;

-- Add user_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_type') 
  THEN
    ALTER TABLE profiles ADD COLUMN user_type text NOT NULL DEFAULT 'student';
  END IF;
END $$;

-- Create guardians table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.guardians (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  is_active boolean DEFAULT true
);

-- Enable RLS on guardians table
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Create policy to allow students to manage their guardians
CREATE POLICY "Students can manage their guardians"
  ON public.guardians
  FOR ALL
  USING (auth.uid() = student_id);

-- Create policy to allow guardians to view their student's locations
CREATE POLICY "Guardians can view student locations"
  ON public.locations
  FOR SELECT
  USING (auth.uid() IN (
    SELECT student_id 
    FROM public.guardians 
    WHERE email = auth.jwt() ->> 'email' 
    AND is_active = true
  ));


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
DROP POLICY IF EXISTS "Students can manage their guardians" ON public.guardians;
CREATE POLICY "Students can manage their guardians"
  ON public.guardians
  FOR ALL
  USING (auth.uid() = student_id);

-- Grant permissions
GRANT ALL ON public.guardians TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS guardians_student_id_idx ON public.guardians(student_id);
CREATE INDEX IF NOT EXISTS guardians_email_idx ON public.guardians(email);

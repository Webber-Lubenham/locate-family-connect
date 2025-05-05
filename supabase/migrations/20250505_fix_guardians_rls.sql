
-- Fix RLS policies for guardians table
-- This ensures students can manage their guardians

-- First, make sure RLS is enabled
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Students can manage their guardians" ON public.guardians;
DROP POLICY IF EXISTS "Estudantes podem gerenciar seus responsáveis" ON public.guardians;

-- Create policy to allow students to view their own guardians
CREATE POLICY "Students can view their own guardians" 
ON public.guardians
FOR SELECT 
USING (auth.uid() = student_id);

-- Create policy to allow students to insert guardians for themselves
CREATE POLICY "Students can add their own guardians" 
ON public.guardians
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Create policy to allow students to update their own guardians
CREATE POLICY "Students can update their own guardians" 
ON public.guardians
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create policy to allow students to delete their own guardians
CREATE POLICY "Students can delete their own guardians" 
ON public.guardians
FOR DELETE 
USING (auth.uid() = student_id);

-- Make sure permissions are granted
GRANT ALL ON public.guardians TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create get_student_guardians_secure function that was missing
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller is authorized to access this student's guardians
  IF auth.uid() <> p_student_id THEN
    RAISE EXCEPTION 'Unauthorized access to student guardians';
  END IF;
  
  -- Return the guardians
  RETURN QUERY
  SELECT g.id, g.student_id, g.email, g.full_name, g.phone, g.is_active, g.created_at
  FROM public.guardians g
  WHERE g.student_id = p_student_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_student_guardians_secure(UUID) TO authenticated;

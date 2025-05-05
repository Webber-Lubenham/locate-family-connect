
-- Fix Row Level Security Policies for guardian-student relationships

-- First, make sure RLS is enabled on relevant tables
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Create a more reliable function to get student locations for parent/guardian
CREATE OR REPLACE FUNCTION public.get_parent_student_locations(
  p_parent_email TEXT, 
  p_student_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_timestamp TIMESTAMP WITH TIME ZONE,
  address TEXT,
  student_name TEXT,
  student_email TEXT
) 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify if the parent/guardian has access to the student
  IF EXISTS (
    SELECT 1 FROM public.guardians 
    WHERE email = p_parent_email 
    AND student_id = p_student_id
    AND is_active = TRUE
  ) THEN
    -- Return student locations with additional data
    RETURN QUERY
    SELECT 
      l.id,
      l.user_id,
      l.latitude,
      l.longitude,
      l.timestamp as location_timestamp,
      l.address,
      p.full_name AS student_name,
      p.email AS student_email
    FROM public.locations l
    LEFT JOIN public.profiles p ON l.user_id = p.user_id
    WHERE l.user_id = p_student_id
    ORDER BY l.timestamp DESC;
  END IF;
  
  -- If verification fails, return empty result set
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_parent_student_locations(TEXT, UUID) TO authenticated;

-- Create policy to allow guardians to access student location data
DROP POLICY IF EXISTS "Guardians can view student locations" ON public.locations;
CREATE POLICY "Guardians can view student locations" 
ON public.locations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.guardians 
    WHERE student_id = user_id
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  )
);


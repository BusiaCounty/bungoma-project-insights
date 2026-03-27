-- Fix previously broken RLS policies for whistleblower_reports that attempted to query auth.users natively

-- Drop the old malfunctioning policies
DROP POLICY IF EXISTS "Whistleblower reports are viewable by admins only" ON public.whistleblower_reports;
DROP POLICY IF EXISTS "Admins can update whistleblower reports" ON public.whistleblower_reports;

-- Recreate SELECT policy using the auth.jwt() metadata (which is universally accessible without auth schema errors)
CREATE POLICY "Whistleblower reports are viewable by admins only" 
ON public.whistleblower_reports 
FOR SELECT 
USING (
  coalesce(auth.jwt()->'user_metadata'->>'role', '') IN ('admin', 'executive')
  OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR 
  public.has_role(auth.uid(), 'executive'::public.app_role)
);

-- Recreate UPDATE policy using the auth.jwt() metadata
CREATE POLICY "Admins can update whistleblower reports" 
ON public.whistleblower_reports 
FOR UPDATE 
USING (
  coalesce(auth.jwt()->'user_metadata'->>'role', '') IN ('admin', 'executive')
  OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR 
  public.has_role(auth.uid(), 'executive'::public.app_role)
)
WITH CHECK (
  coalesce(auth.jwt()->'user_metadata'->>'role', '') IN ('admin', 'executive')
  OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR 
  public.has_role(auth.uid(), 'executive'::public.app_role)
);

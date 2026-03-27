-- Add UPDATE policy for admins to resolve and reply to whistleblower reports
CREATE POLICY "Admins can update whistleblower reports" 
ON public.whistleblower_reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'executive')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'executive')
  )
);

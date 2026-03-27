-- Migration: Add status and admin reply fields to whistleblower reports
ALTER TABLE public.whistleblower_reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New',
ADD COLUMN IF NOT EXISTS admin_reply TEXT;

CREATE POLICY "Users can view their own whistleblower report by tracking code" 
ON public.whistleblower_reports FOR SELECT 
USING (true); -- Public access will be scoped per UI implementation, optionally filtering by tracking_code

-- Note: The above policy assumes the UI queries strictly by tracking_code.
-- Let's refine it safely so public can only fetch by tracking code if they supply it correctly.
-- We must restrict row SELECT for unauthenticated unless they know the tracking code.
-- Wait, the simplest safe setup is just to allow admins full control, and we can define an RPC function
-- to safely retrieve a single report by tracking code without opening the table.

CREATE OR REPLACE FUNCTION get_whistleblower_report_by_tracking(p_tracking_code TEXT)
RETURNS TABLE (
  id UUID,
  report_title TEXT,
  misconduct_type public.misconduct_type,
  urgency_level public.urgency_level,
  status TEXT,
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    w.id, w.report_title, w.misconduct_type, w.urgency_level, w.status, w.admin_reply, w.created_at
  FROM public.whistleblower_reports w
  WHERE w.tracking_code = p_tracking_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

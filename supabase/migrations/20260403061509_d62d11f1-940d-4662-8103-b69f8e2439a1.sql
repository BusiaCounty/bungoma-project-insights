-- Add assignment columns to project_feedback
ALTER TABLE public.project_feedback
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN assigned_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN internal_note TEXT DEFAULT NULL;

-- Allow assigned users to view feedback assigned to them
CREATE POLICY "Assigned users can view their feedback"
ON public.project_feedback
FOR SELECT
TO authenticated
USING (assigned_to = auth.uid());

-- Allow assigned users to update feedback (for replying via status changes)
CREATE POLICY "Assigned users can update their feedback"
ON public.project_feedback
FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());
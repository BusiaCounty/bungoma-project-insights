
-- Add status column to project_feedback
ALTER TABLE public.project_feedback 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New';

-- Create feedback_replies table for threaded conversations
CREATE TABLE public.feedback_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid REFERENCES public.project_feedback(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL DEFAULT 'Admin',
  message text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read replies
CREATE POLICY "Replies viewable by everyone"
  ON public.feedback_replies FOR SELECT TO public
  USING (true);

-- Authenticated users can insert replies
CREATE POLICY "Authenticated can insert replies"
  ON public.feedback_replies FOR INSERT TO authenticated
  WITH CHECK (true);

-- Anyone can insert replies (citizen responses)
CREATE POLICY "Public can insert replies"
  ON public.feedback_replies FOR INSERT TO public
  WITH CHECK (true);

-- Allow authenticated users to update feedback status
CREATE POLICY "Authenticated can update feedback"
  ON public.project_feedback FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Enable realtime for replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_replies;


-- Add tracking_number column to project_feedback for citizen tracking
ALTER TABLE public.project_feedback
  ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE;

-- Create a function to auto-generate a tracking number on insert
CREATE OR REPLACE FUNCTION public.generate_feedback_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'FB';
  yr TEXT := TO_CHAR(NOW(), 'YY');
  seq INT;
  tracking TEXT;
BEGIN
  -- Get count of feedback this year for sequential numbering
  SELECT COUNT(*) + 1 INTO seq
  FROM public.project_feedback
  WHERE created_at >= DATE_TRUNC('year', NOW());

  -- Generate tracking number: FB-25-000001
  tracking := prefix || '-' || yr || '-' || LPAD(seq::TEXT, 6, '0');

  -- Ensure uniqueness with a random suffix if collision
  WHILE EXISTS (SELECT 1 FROM public.project_feedback WHERE tracking_number = tracking) LOOP
    seq := seq + 1;
    tracking := prefix || '-' || yr || '-' || LPAD(seq::TEXT, 6, '0');
  END LOOP;

  NEW.tracking_number := tracking;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate tracking number before insert
CREATE TRIGGER set_feedback_tracking_number
  BEFORE INSERT ON public.project_feedback
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL)
  EXECUTE FUNCTION public.generate_feedback_tracking_number();

-- Backfill existing feedback with tracking numbers
DO $$
DECLARE
  rec RECORD;
  prefix TEXT := 'FB';
  yr TEXT;
  seq INT := 0;
BEGIN
  FOR rec IN SELECT id, created_at FROM public.project_feedback ORDER BY created_at ASC LOOP
    seq := seq + 1;
    yr := TO_CHAR(rec.created_at, 'YY');
    UPDATE public.project_feedback 
      SET tracking_number = prefix || '-' || yr || '-' || LPAD(seq::TEXT, 6, '0')
      WHERE id = rec.id AND tracking_number IS NULL;
  END LOOP;
END $$;

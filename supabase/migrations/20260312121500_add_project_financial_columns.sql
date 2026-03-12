-- Add financial tracking columns to projects for admin financials dashboard

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS actual_spend NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS projected_cost NUMERIC;


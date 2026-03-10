
-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('Completed', 'Ongoing', 'Stalled');

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sub_county TEXT NOT NULL,
  ward TEXT NOT NULL,
  sector TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'Ongoing',
  budget NUMERIC NOT NULL DEFAULT 0,
  fy TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);

-- Whistleblower reports table
CREATE TABLE public.whistleblower_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT,
  sub_county TEXT,
  description TEXT NOT NULL,
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whistleblower_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a whistleblower report" ON public.whistleblower_reports FOR INSERT WITH CHECK (true);

-- Feedback table
CREATE TABLE public.project_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  comment TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback is viewable by everyone" ON public.project_feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can submit feedback" ON public.project_feedback FOR INSERT WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

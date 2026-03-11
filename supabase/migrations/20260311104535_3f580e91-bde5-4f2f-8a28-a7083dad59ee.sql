
-- Committee members per project
CREATE TABLE public.committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'Member',
  phone text,
  email text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Committee members viewable by everyone"
  ON public.committee_members FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage committee members"
  ON public.committee_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Committee meetings per project
CREATE TABLE public.committee_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  meeting_date date NOT NULL DEFAULT CURRENT_DATE,
  agenda text NOT NULL,
  decisions text,
  attendees text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meetings viewable by everyone"
  ON public.committee_meetings FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage meetings"
  ON public.committee_meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Committee tasks per project
CREATE TABLE public.committee_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES public.committee_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Pending',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks viewable by everyone"
  ON public.committee_tasks FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage tasks"
  ON public.committee_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

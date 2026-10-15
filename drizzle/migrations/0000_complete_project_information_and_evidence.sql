ALTER TABLE public.projects
 ADD COLUMN IF NOT EXISTS implementing_department text,
 ADD COLUMN IF NOT EXISTS contractor text,
 ADD COLUMN IF NOT EXISTS contract_value numeric,
 ADD COLUMN IF NOT EXISTS expected_completion_date date,
 ADD COLUMN IF NOT EXISTS challenges text,
 ADD COLUMN IF NOT EXISTS specific_location text,
 ADD COLUMN IF NOT EXISTS expenditure_confirmed boolean NOT NULL DEFAULT false;
UPDATE public.projects SET expenditure_confirmed = true WHERE actual_spend > 0;
CREATE TABLE public.project_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
 file_name text NOT NULL,
 storage_path text NOT NULL UNIQUE,
 mime_type text NOT NULL,
 file_size bigint NOT NULL,
 caption text,
 uploaded_by uuid,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_evidence TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_evidence TO authenticated;
GRANT ALL ON public.project_evidence TO service_role;
ALTER TABLE public.project_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project evidence is public" ON public.project_evidence FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Project editors manage evidence" ON public.project_evidence FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) WITH CHECK ((public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) AND uploaded_by = auth.uid());
CREATE INDEX project_evidence_project_idx ON public.project_evidence(project_id);
CREATE POLICY "Read published project evidence" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-evidence' AND EXISTS (SELECT 1 FROM public.project_evidence e WHERE e.storage_path = name));
CREATE POLICY "Project editors upload evidence" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-evidence' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id::text = (storage.foldername(name))[1]));
CREATE POLICY "Project editors remove evidence files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-evidence' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
CREATE OR REPLACE FUNCTION public.validate_project_information() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.contract_value IS NOT NULL AND NEW.contract_value < 0 THEN RAISE EXCEPTION 'Contract value cannot be negative'; END IF;
 IF NEW.actual_spend < 0 OR NEW.budget < 0 OR (NEW.projected_cost IS NOT NULL AND NEW.projected_cost < 0) THEN RAISE EXCEPTION 'Financial amounts cannot be negative'; END IF;
 IF NEW.progress < 0 OR NEW.progress > 100 THEN RAISE EXCEPTION 'Physical progress must be between 0 and 100'; END IF;
 IF (NEW.latitude IS NULL) <> (NEW.longitude IS NULL) THEN RAISE EXCEPTION 'Provide both latitude and longitude'; END IF;
 IF NEW.latitude < -90 OR NEW.latitude > 90 OR NEW.longitude < -180 OR NEW.longitude > 180 THEN RAISE EXCEPTION 'Coordinates are outside the valid range'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_project_information BEFORE INSERT OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.validate_project_information();
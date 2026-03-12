
-- Allow authenticated users to insert projects
CREATE POLICY "Authenticated users can insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Authenticated users can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (true);

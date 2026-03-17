-- Add GPS coordinates to projects
-- Latitude range:  -90..90
-- Longitude range: -180..180

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Optional: basic range checks (kept permissive with NULLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_latitude_range'
  ) THEN
    ALTER TABLE public.projects
    ADD CONSTRAINT projects_latitude_range
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_longitude_range'
  ) THEN
    ALTER TABLE public.projects
    ADD CONSTRAINT projects_longitude_range
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;


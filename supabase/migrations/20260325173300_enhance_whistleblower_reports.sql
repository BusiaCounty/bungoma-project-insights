-- Enhanced whistleblower reports table with comprehensive fields

-- Add enums for structured data
CREATE TYPE public.report_type AS ENUM ('Anonymous', 'Identified');
CREATE TYPE public.contact_method AS ENUM ('Email', 'Phone', 'None');
CREATE TYPE public.relationship_to_org AS ENUM ('Employee', 'Contractor', 'Citizen/Public', 'Vendor/Partner', 'Other');
CREATE TYPE public.misconduct_type AS ENUM ('Fraud', 'Corruption', 'Abuse of Office', 'Harassment', 'Financial Mismanagement', 'Procurement Irregularities', 'Data Misuse', 'Other');
CREATE TYPE public.impact_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.urgency_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.incident_relationship AS ENUM ('Directly involved', 'Witness', 'Supervisor');

-- First, create a backup of existing data
CREATE TABLE public.whistleblower_reports_backup AS 
SELECT * FROM public.whistleblower_reports;

-- Drop the existing table and recreate with enhanced structure
DROP TABLE IF EXISTS public.whistleblower_reports;

CREATE TABLE public.whistleblower_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Section 1: Reporter Information
  report_type report_type NOT NULL DEFAULT 'Anonymous',
  full_name TEXT, -- Optional if anonymous
  contact_email TEXT,
  phone_number TEXT,
  preferred_contact_method contact_method DEFAULT 'None',
  relationship_to_org relationship_to_org,
  relationship_other TEXT, -- If relationship is 'Other'
  
  -- Section 2: Incident Details
  report_title TEXT NOT NULL,
  misconduct_type misconduct_type NOT NULL,
  misconduct_other TEXT, -- If misconduct_type is 'Other'
  incident_description TEXT NOT NULL,
  incident_date DATE,
  incident_date_end DATE, -- For date range
  county TEXT,
  sub_county TEXT,
  ward TEXT,
  specific_location TEXT,
  
  -- Section 3: Persons Involved
  persons_involved JSONB, -- Array of involved persons with details
  
  -- Section 4: Evidence & Documentation
  evidence_description TEXT,
  additional_witnesses BOOLEAN DEFAULT false,
  witness_details TEXT,
  
  -- Section 5: Impact & Risk Assessment
  estimated_impact TEXT[], -- Array of impact types
  issue_ongoing BOOLEAN DEFAULT false,
  urgency_level urgency_level DEFAULT 'Medium',
  
  -- Section 6: Confidentiality & Consent
  confidentiality_preference BOOLEAN DEFAULT true, -- Keep identity confidential
  consent_to_contact BOOLEAN DEFAULT false,
  consent_statement BOOLEAN DEFAULT false,
  policy_acknowledgment BOOLEAN DEFAULT false,
  
  -- Section 7: Follow-Up
  receive_updates BOOLEAN DEFAULT false,
  tracking_code TEXT UNIQUE, -- Auto-generated secure code
  
  -- Legacy fields for backward compatibility
  project_name TEXT,
  evidence TEXT, -- Legacy evidence field
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whistleblower_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit a whistleblower report" ON public.whistleblower_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Whistleblower reports are viewable by admins only" ON public.whistleblower_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'executive')
  )
);

-- Create index for tracking code lookup
CREATE INDEX idx_whistleblower_reports_tracking_code ON public.whistleblower_reports(tracking_code);

-- Function to generate secure tracking code
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars)) + 1, 1);
  END LOOP;
  RETURN 'WB-' || code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking code
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whistleblower_reports_tracking_code_trigger
  BEFORE INSERT ON public.whistleblower_reports
  FOR EACH ROW EXECUTE FUNCTION set_tracking_code();

-- Updated_at trigger
CREATE TRIGGER update_whistleblower_reports_updated_at
  BEFORE UPDATE ON public.whistleblower_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

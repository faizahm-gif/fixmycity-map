-- Create enum for threat level
CREATE TYPE public.threat_level AS ENUM ('high', 'medium', 'low');

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_address TEXT,
  threat_level public.threat_level DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public to read all reports
CREATE POLICY "Anyone can view reports"
ON public.reports
FOR SELECT
USING (true);

-- Allow anyone to insert reports (for now, without auth)
CREATE POLICY "Anyone can create reports"
ON public.reports
FOR INSERT
WITH CHECK (true);

-- Storage policies for report images
CREATE POLICY "Anyone can view report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-images');

CREATE POLICY "Anyone can upload report images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'report-images');
-- Add category and accent columns to presentations table
ALTER TABLE public.presentations 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS accent TEXT DEFAULT 'electric';

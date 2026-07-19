-- Migration to fix missing columns (thumbnail_url, status, category, accent, created_at, updated_at) 
-- in presentations and verify full schema integrity without deleting existing data.

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ensure presentations table exists
CREATE TABLE IF NOT EXISTS public.presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT
);

-- 4. Alter presentations to safely add all required columns
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS accent TEXT DEFAULT 'electric';
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. Ensure slides table exists
CREATE TABLE IF NOT EXISTS public.slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL,
  slide_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- 7. Policies setup (Recreated safely)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own presentations" ON public.presentations;
CREATE POLICY "Users can manage own presentations" ON public.presentations
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage slides of own presentations" ON public.slides;
CREATE POLICY "Users can manage slides of own presentations" ON public.slides
  FOR ALL USING (
    presentation_id IN (
      SELECT p.id FROM public.presentations p WHERE p.user_id = auth.uid()
    )
  );

-- 8. Trigger function for auto-profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function for tracking updated_at changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers safely
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_presentations_updated_at ON public.presentations;
CREATE TRIGGER set_presentations_updated_at
  BEFORE UPDATE ON public.presentations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_slides_updated_at ON public.slides;
CREATE TRIGGER set_slides_updated_at
  BEFORE UPDATE ON public.slides
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Add Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON public.slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id_order ON public.slides(presentation_id, slide_order);

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

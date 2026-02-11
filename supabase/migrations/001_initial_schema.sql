-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums
CREATE TABLE public.albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creations (generated images/videos)
CREATE TABLE public.creations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT NOT NULL,
  video_url TEXT,
  style TEXT NOT NULL,
  prompt TEXT,
  caption TEXT,
  job_title TEXT,
  accessories TEXT,
  location TEXT,
  gender TEXT,
  cost DECIMAL(10,6),
  output_size TEXT DEFAULT '1024x1024',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own albums" ON public.albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own albums" ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own albums" ON public.albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own albums" ON public.albums FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own creations" ON public.creations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own creations" ON public.creations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own creations" ON public.creations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own creations" ON public.creations FOR DELETE USING (auth.uid() = user_id);
-- Public creations viewable by anyone
CREATE POLICY "Anyone can view public creations" ON public.creations FOR SELECT USING (is_public = TRUE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
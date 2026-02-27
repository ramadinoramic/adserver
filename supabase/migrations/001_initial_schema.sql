-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Brand Kits
CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '[]',
  fonts JSONB NOT NULL DEFAULT '{}',
  logos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Creatives
CREATE TABLE IF NOT EXISTS creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  active_sizes JSONB NOT NULL DEFAULT '[{"name": "Medium Rectangle", "width": 300, "height": 250, "platform": "google_display"}]',
  offer_data JSONB NOT NULL DEFAULT '{}',
  compliance_status JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS creatives_updated_at ON creatives;
CREATE TRIGGER creatives_updated_at
  BEFORE UPDATE ON creatives
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  width INT,
  height INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('casino', 'sportsbook', 'poker', 'crypto', 'generic')),
  offer_type TEXT NOT NULL CHECK (offer_type IN ('welcome_bonus', 'free_spins', 'cashback', 'no_deposit', 'reload')),
  thumbnail_url TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  active_sizes JSONB NOT NULL DEFAULT '[]',
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Brand kits policies
CREATE POLICY "Users can CRUD own brand kits" ON brand_kits
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can CRUD own projects" ON projects
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Creatives policies
CREATE POLICY "Users can access own creatives" ON creatives
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- Assets policies
CREATE POLICY "Users can CRUD own assets" ON assets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Templates policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read templates" ON templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_creatives_project_id ON creatives(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_id ON brand_kits(user_id);

-- Storage buckets (run these in Supabase Dashboard or via storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true) ON CONFLICT DO NOTHING;

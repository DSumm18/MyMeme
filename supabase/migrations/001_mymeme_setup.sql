-- MyMeme Database Setup (dedicated Supabase project)
-- Run this in SQL Editor after project is provisioned

-- User credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: users can read their own credits
CREATE POLICY "Users can read own credits" ON public.user_credits
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: users can insert their own credits
CREATE POLICY "Users can insert own credits" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: users can update their own credits  
CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Service role can do anything (for webhook/server-side)
CREATE POLICY "Service role full access" ON public.user_credits
  FOR ALL USING (auth.role() = 'service_role');

-- Deduct credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;

  IF current_credits IS NULL OR current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE public.user_credits 
  SET credits = credits - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits function
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET credits = public.user_credits.credits + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

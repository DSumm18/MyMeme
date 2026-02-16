-- MyMeme User Credits Table
-- Tracks per-user credit balance for image generation and animation
-- All operations use SECURITY DEFINER functions to ensure atomic transactions

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own credits
CREATE POLICY "Users can read own credits" ON public.user_credits
  FOR SELECT USING (auth.uid()::text = user_id);

-- RLS Policy: Users can insert their own credits (for initialization)
CREATE POLICY "Users can insert own credits" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Users can update their own credits
CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS Policy: Service role full access (for webhooks/server-side operations)
CREATE POLICY "Service role full access" ON public.user_credits
  FOR ALL USING (auth.role() = 'service_role');

-- Atomic deduct credits function
-- Returns FALSE if insufficient credits, TRUE on success
-- Uses SECURITY DEFINER to bypass RLS for transactional integrity
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Select with FOR UPDATE to lock row and prevent race conditions
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists and has sufficient credits
  IF current_credits IS NULL OR current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Atomically deduct credits
  UPDATE public.user_credits 
  SET credits = credits - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic add credits function
-- Uses SECURITY DEFINER to bypass RLS
-- Safe for webhook handlers and server-side operations
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET credits = public.user_credits.credits + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_credits table
DROP TRIGGER IF EXISTS update_user_credits_modtime ON public.user_credits;
CREATE TRIGGER update_user_credits_modtime
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

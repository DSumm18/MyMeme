-- Create user_credits table in mymeme schema
CREATE TABLE IF NOT EXISTS mymeme.user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER DEFAULT 3 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to use the update function
CREATE TRIGGER update_user_credits_modtime
BEFORE UPDATE ON mymeme.user_credits
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
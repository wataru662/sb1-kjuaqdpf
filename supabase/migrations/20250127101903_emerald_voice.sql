/*
  # DM Auto Reply Rules Schema

  1. New Tables
    - `dm_auto_reply_rules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `match_text` (text)
      - `match_type` (text)
      - `reply_text` (text)
      - `reply_type` (text)
      - `reply_timing` (text)
      - `reply_duration` (text)
      - `reply_limit` (text)
      - `enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own rules
    - Add indexes for performance

  3. Validation
    - Add CHECK constraints for enum fields
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS dm_auto_reply_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    match_text text NOT NULL,
    match_type text NOT NULL CHECK (match_type IN ('exact', 'contains')),
    reply_text text NOT NULL,
    reply_type text NOT NULL CHECK (reply_type IN ('comment', 'dm')),
    reply_timing text NOT NULL CHECK (reply_timing IN ('1hour', '3hours', '6hours', '12hours')),
    reply_duration text NOT NULL CHECK (reply_duration IN ('1day', '3days', '7days', '30days', 'unlimited')),
    reply_limit text NOT NULL CHECK (reply_limit IN ('1', 'unlimited')),
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
DO $$ BEGIN
  ALTER TABLE dm_auto_reply_rules ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND policyname = 'Users can view own rules'
  ) THEN
    CREATE POLICY "Users can view own rules"
      ON dm_auto_reply_rules
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND policyname = 'Users can insert own rules'
  ) THEN
    CREATE POLICY "Users can insert own rules"
      ON dm_auto_reply_rules
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND policyname = 'Users can update own rules'
  ) THEN
    CREATE POLICY "Users can update own rules"
      ON dm_auto_reply_rules
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND policyname = 'Users can delete own rules'
  ) THEN
    CREATE POLICY "Users can delete own rules"
      ON dm_auto_reply_rules
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_dm_auto_reply_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger to ensure it's up to date
DROP TRIGGER IF EXISTS update_dm_auto_reply_rules_updated_at ON dm_auto_reply_rules;
CREATE TRIGGER update_dm_auto_reply_rules_updated_at
  BEFORE UPDATE
  ON dm_auto_reply_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_dm_auto_reply_rules_updated_at();

-- Create indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND indexname = 'idx_dm_auto_reply_rules_user_id'
  ) THEN
    CREATE INDEX idx_dm_auto_reply_rules_user_id ON dm_auto_reply_rules(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'dm_auto_reply_rules' 
    AND indexname = 'idx_dm_auto_reply_rules_enabled'
  ) THEN
    CREATE INDEX idx_dm_auto_reply_rules_enabled ON dm_auto_reply_rules(enabled);
  END IF;
END $$;
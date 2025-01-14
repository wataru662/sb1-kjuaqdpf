/*
  # Add post reply settings table

  1. New Tables
    - `post_reply_settings` (if not exists)
      - `id` (uuid, primary key)
      - `post_id` (text, not null)
      - `user_id` (uuid, references auth.users)
      - `match_text` (text, not null)
      - `match_type` (text, not null)
      - `reply_text` (text, not null)
      - `reply_type` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS (if not already enabled)
    - Add policies for authenticated users (if they don't exist)
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS post_reply_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id text NOT NULL,
    user_id uuid REFERENCES auth.users NOT NULL,
    match_text text NOT NULL,
    match_type text NOT NULL,
    reply_text text NOT NULL,
    reply_type text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
DO $$ BEGIN
  ALTER TABLE post_reply_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reply_settings' 
    AND policyname = 'Users can view own reply settings'
  ) THEN
    CREATE POLICY "Users can view own reply settings"
      ON post_reply_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reply_settings' 
    AND policyname = 'Users can insert own reply settings'
  ) THEN
    CREATE POLICY "Users can insert own reply settings"
      ON post_reply_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reply_settings' 
    AND policyname = 'Users can update own reply settings'
  ) THEN
    CREATE POLICY "Users can update own reply settings"
      ON post_reply_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reply_settings' 
    AND policyname = 'Users can delete own reply settings'
  ) THEN
    CREATE POLICY "Users can delete own reply settings"
      ON post_reply_settings
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_reply_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger to ensure it's up to date
DROP TRIGGER IF EXISTS update_post_reply_settings_updated_at ON post_reply_settings;
CREATE TRIGGER update_post_reply_settings_updated_at
  BEFORE UPDATE
  ON post_reply_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_settings_updated_at();
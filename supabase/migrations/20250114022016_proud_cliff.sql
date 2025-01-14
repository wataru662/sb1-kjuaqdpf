/*
  # Add reply settings table

  1. New Tables
    - `post_reply_settings`
      - `id` (uuid, primary key)
      - `post_id` (text, not null) - Instagram post ID
      - `user_id` (uuid, not null) - Reference to auth.users
      - `match_text` (text, not null)
      - `match_type` (text, not null)
      - `reply_text` (text, not null)
      - `reply_type` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `post_reply_settings` table
    - Add policies for authenticated users to manage their own settings
*/

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

ALTER TABLE post_reply_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own settings
CREATE POLICY "Users can view own reply settings"
  ON post_reply_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert own reply settings"
  ON post_reply_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own settings
CREATE POLICY "Users can update own reply settings"
  ON post_reply_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own settings
CREATE POLICY "Users can delete own reply settings"
  ON post_reply_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reply_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_reply_settings_updated_at
  BEFORE UPDATE
  ON post_reply_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_settings_updated_at();
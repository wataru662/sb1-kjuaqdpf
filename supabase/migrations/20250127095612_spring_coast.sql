/*
  # Create DM Auto Reply Rules Table

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
    - Enable RLS on `dm_auto_reply_rules` table
    - Add policies for authenticated users to manage their own rules
*/

-- Create dm_auto_reply_rules table
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

-- Enable RLS
ALTER TABLE dm_auto_reply_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own rules"
  ON dm_auto_reply_rules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules"
  ON dm_auto_reply_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
  ON dm_auto_reply_rules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
  ON dm_auto_reply_rules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dm_auto_reply_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dm_auto_reply_rules_updated_at
  BEFORE UPDATE
  ON dm_auto_reply_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_dm_auto_reply_rules_updated_at();

-- Create indexes
CREATE INDEX idx_dm_auto_reply_rules_user_id ON dm_auto_reply_rules(user_id);
CREATE INDEX idx_dm_auto_reply_rules_enabled ON dm_auto_reply_rules(enabled);
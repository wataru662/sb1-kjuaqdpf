/*
  # Instagram Metrics Schema

  1. New Tables
    - `instagram_posts`
      - `id` (uuid, primary key)
      - `instagram_id` (text, unique)
      - `image_url` (text)
      - `posted_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `post_metrics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references instagram_posts)
      - `likes` (integer)
      - `comments` (integer)
      - `saves` (integer)
      - `reach` (integer)
      - `engagement_rate` (numeric)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)

    - `account_metrics`
      - `id` (uuid, primary key)
      - `followers` (integer)
      - `following` (integer)
      - `total_posts` (integer)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create instagram_posts table
CREATE TABLE IF NOT EXISTS instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_id text UNIQUE NOT NULL,
  image_url text NOT NULL,
  posted_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create post_metrics table
CREATE TABLE IF NOT EXISTS post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES instagram_posts(id) ON DELETE CASCADE,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  engagement_rate numeric(5,2) NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create account_metrics table
CREATE TABLE IF NOT EXISTS account_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  followers integer NOT NULL DEFAULT 0,
  following integer NOT NULL DEFAULT 0,
  total_posts integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access to instagram_posts"
  ON instagram_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access to post_metrics"
  ON post_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read access to account_metrics"
  ON account_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_account_metrics_recorded_at ON account_metrics(recorded_at);
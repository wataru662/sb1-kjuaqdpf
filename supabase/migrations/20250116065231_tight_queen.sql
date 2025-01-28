/*
  # Add subscription system

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (integer)
      - `features` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan_id` (uuid, references subscription_plans)
      - `status` (text)
      - `trial_ends_at` (timestamptz)
      - `current_period_ends_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL,
  features jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  plan_id uuid REFERENCES subscription_plans NOT NULL,
  status text NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'expired')),
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans
CREATE POLICY "Allow authenticated read access to subscription_plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE
  ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE
  ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, features) VALUES
  ('Basic', 980, '{
    "max_auto_replies": 5,
    "reply_templates": 10,
    "analytics_retention_days": 30
  }'),
  ('Pro', 1980, '{
    "max_auto_replies": 20,
    "reply_templates": 50,
    "analytics_retention_days": 90,
    "advanced_analytics": true,
    "priority_support": true
  }'),
  ('Enterprise', 4980, '{
    "max_auto_replies": -1,
    "reply_templates": -1,
    "analytics_retention_days": 365,
    "advanced_analytics": true,
    "priority_support": true,
    "custom_branding": true,
    "api_access": true
  }');
-- Add content_type and content_id columns to dm_auto_reply_rules
ALTER TABLE dm_auto_reply_rules 
ADD COLUMN IF NOT EXISTS content_type text CHECK (content_type IN ('post', 'story', 'dm')),
ADD COLUMN IF NOT EXISTS content_id text;

-- Create index for content_type
CREATE INDEX IF NOT EXISTS idx_dm_auto_reply_rules_content_type 
ON dm_auto_reply_rules(content_type);
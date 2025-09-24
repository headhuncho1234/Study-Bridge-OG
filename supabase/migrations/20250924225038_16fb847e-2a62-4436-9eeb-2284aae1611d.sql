-- Add channel field to community_posts table
ALTER TABLE public.community_posts 
ADD COLUMN channel text DEFAULT 'general' NOT NULL;

-- Add index for better performance when filtering by channel
CREATE INDEX idx_community_posts_channel ON public.community_posts(channel);

-- Update existing posts to have 'general' channel (already handled by DEFAULT)
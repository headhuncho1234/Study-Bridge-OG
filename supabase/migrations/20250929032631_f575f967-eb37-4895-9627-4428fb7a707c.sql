-- Fix comment count triggers and update existing counts
-- First, create a proper trigger for comment count updates
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS comment_count_trigger ON public.comments;
CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Update all existing comment counts to correct values
UPDATE public.community_posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM public.comments 
  WHERE comments.post_id = community_posts.id
);

-- Update all existing like counts to correct values  
UPDATE public.community_posts 
SET 
  likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = community_posts.id AND is_like = true),
  dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = community_posts.id AND is_like = false);
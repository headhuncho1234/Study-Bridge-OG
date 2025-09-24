-- Create function to increment comment count
CREATE OR REPLACE FUNCTION public.increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.community_posts 
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update like/dislike counts
CREATE OR REPLACE FUNCTION public.update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      -- Update post like counts
      UPDATE public.community_posts 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = NEW.post_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = NEW.post_id AND is_like = false)
      WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      -- Update comment like counts
      UPDATE public.comments 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = NEW.comment_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = NEW.comment_id AND is_like = false)
      WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS NOT NULL THEN
      -- Update post like counts
      UPDATE public.community_posts 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = NEW.post_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = NEW.post_id AND is_like = false)
      WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      -- Update comment like counts
      UPDATE public.comments 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = NEW.comment_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = NEW.comment_id AND is_like = false)
      WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      -- Update post like counts
      UPDATE public.community_posts 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = OLD.post_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = OLD.post_id AND is_like = false)
      WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      -- Update comment like counts
      UPDATE public.comments 
      SET 
        likes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = OLD.comment_id AND is_like = true),
        dislikes_count = (SELECT COUNT(*) FROM public.likes WHERE comment_id = OLD.comment_id AND is_like = false)
      WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic like count updates
DROP TRIGGER IF EXISTS trigger_update_like_counts ON public.likes;
CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_like_counts();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
-- Clean up blob URLs from existing community posts
UPDATE public.community_posts 
SET images = '{}' 
WHERE images IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE 'blob:%'
  );

-- Add images column to comments table for image support in comments
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN public.comments.images IS 'Array of image URLs attached to the comment';
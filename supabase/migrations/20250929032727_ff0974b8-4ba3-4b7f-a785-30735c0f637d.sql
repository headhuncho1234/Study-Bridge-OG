-- Fix search path for security compliance
ALTER FUNCTION public.update_comment_count() SET search_path = 'public';
ALTER FUNCTION public.increment_comment_count(uuid) SET search_path = 'public';
ALTER FUNCTION public.update_like_counts() SET search_path = 'public';
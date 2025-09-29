-- Fix function search path for security
ALTER FUNCTION public.update_comment_count() SET search_path TO 'public';
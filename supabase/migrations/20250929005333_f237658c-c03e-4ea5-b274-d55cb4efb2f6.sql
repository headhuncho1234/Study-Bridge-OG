-- Drop the overly permissive policy that allows everyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add an explicit policy to block anonymous users from viewing profiles
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);
-- Add missing columns to profiles table for comprehensive user data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS questionnaire_results JSONB DEFAULT '[]'::jsonb;

-- Create index for performance on questionnaire_results queries
CREATE INDEX IF NOT EXISTS idx_profiles_questionnaire_results ON public.profiles USING GIN (questionnaire_results);

-- Create index for coins for scoreboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_coins ON public.profiles (coins DESC);

-- Update existing profiles to have 0 coins if null
UPDATE public.profiles SET coins = 0 WHERE coins IS NULL;
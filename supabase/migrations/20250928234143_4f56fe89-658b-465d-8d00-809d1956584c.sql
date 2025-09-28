-- Create schools table for questionnaire results
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  tuition DECIMAL(10,2),
  acceptance_rate TEXT,
  difficulty TEXT,
  scholarships JSONB DEFAULT '[]'::jsonb,
  details JSONB DEFAULT '{}'::jsonb,
  location TEXT,
  ranking TEXT,
  programs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (schools are public information)
CREATE POLICY "Schools are viewable by everyone" 
ON public.schools 
FOR SELECT 
USING (true);

-- Only allow admins to modify schools (no insert/update/delete for regular users)
-- This can be managed through direct database access or admin functions

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample schools
INSERT INTO public.schools (name, website, tuition, acceptance_rate, difficulty, location, ranking, programs, scholarships, details) VALUES
('Harvard University', 'https://harvard.edu', 54269.00, '3.4%', 'Very Hard', 'Cambridge, MA', '#1 National Universities', ARRAY['Business', 'Medicine', 'Law', 'Engineering'], 
 '[{"name": "Harvard Scholarship", "amount": "$60,000", "eligibility": "Need-based", "deadline": "January 1"}]'::jsonb,
 '{"campus_size": "Large", "student_body": 23000, "description": "Prestigious Ivy League institution with world-class programs"}'::jsonb),

('Stanford University', 'https://stanford.edu', 58416.00, '4.3%', 'Very Hard', 'Stanford, CA', '#2 National Universities', ARRAY['Engineering', 'Computer Science', 'Business', 'Medicine'], 
 '[{"name": "Stanford Aid", "amount": "$50,000", "eligibility": "Need-based", "deadline": "February 15"}]'::jsonb,
 '{"campus_size": "Large", "student_body": 17000, "description": "Leading research university in Silicon Valley"}'::jsonb),

('MIT', 'https://mit.edu', 57986.00, '6.7%', 'Very Hard', 'Cambridge, MA', '#3 National Universities', ARRAY['Engineering', 'Computer Science', 'Physics', 'Mathematics'], 
 '[{"name": "MIT Grant", "amount": "$45,000", "eligibility": "Need-based", "deadline": "January 1"}]'::jsonb,
 '{"campus_size": "Medium", "student_body": 11500, "description": "World-renowned institute of technology and innovation"}'::jsonb),

('University of California Berkeley', 'https://berkeley.edu', 46326.00, '16.3%', 'Hard', 'Berkeley, CA', '#4 National Universities', ARRAY['Engineering', 'Business', 'Computer Science', 'Liberal Arts'], 
 '[{"name": "Berkeley Scholarship", "amount": "$25,000", "eligibility": "Merit-based", "deadline": "November 30"}]'::jsonb,
 '{"campus_size": "Large", "student_body": 45000, "description": "Top public research university with diverse programs"}'::jsonb),

('University of Texas Austin', 'https://utexas.edu', 41998.00, '31.8%', 'Moderate', 'Austin, TX', '#38 National Universities', ARRAY['Engineering', 'Business', 'Liberal Arts', 'Natural Sciences'], 
 '[{"name": "UT Scholarship", "amount": "$15,000", "eligibility": "Merit-based", "deadline": "December 1"}]'::jsonb,
 '{"campus_size": "Very Large", "student_body": 52000, "description": "Large public research university with strong programs"}'::jsonb);
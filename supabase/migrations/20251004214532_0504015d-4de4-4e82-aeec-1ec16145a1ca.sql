-- Fix broken product images for Mini Wellness Bear and Mindful Living Band
UPDATE wellness_products 
SET image_url = 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400&h=400&fit=crop'
WHERE name = 'Mini Wellness Bear';

UPDATE wellness_products 
SET image_url = 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop'
WHERE name = 'Mindful Living Band';

-- Create scholarships table for real scholarship listings
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount TEXT NOT NULL,
  deadline DATE NOT NULL,
  eligibility TEXT NOT NULL,
  description TEXT NOT NULL,
  application_link TEXT,
  category TEXT NOT NULL,
  country TEXT,
  field_of_study TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing scholarships (public access)
CREATE POLICY "Scholarships are viewable by everyone"
ON public.scholarships
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_scholarships_updated_at
BEFORE UPDATE ON public.scholarships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with real scholarship data
INSERT INTO public.scholarships (title, provider, amount, deadline, eligibility, description, application_link, category, country, field_of_study) VALUES
('Fulbright Foreign Student Program', 'U.S. Department of State', '$25,000 - Full Tuition', '2025-10-15', 'International students, Strong academic record', 'The Fulbright Program provides grants for international students to study in the United States for graduate-level degrees.', 'https://foreign.fulbrightonline.org', 'Merit-Based', 'All Countries', 'All Fields'),
('AAUW International Fellowships', 'American Association of University Women', '$18,000 - $30,000', '2025-11-15', 'Women international students, Graduate study', 'Fellowships for women who are not U.S. citizens or permanent residents pursuing full-time graduate or postdoctoral study in the U.S.', 'https://www.aauw.org/what-we-do/educational-funding-and-awards/international-fellowships/', 'Women', 'All Countries', 'All Fields'),
('Rotary Peace Fellowship', 'Rotary Foundation', 'Full Tuition + Living Expenses', '2025-05-15', 'Strong commitment to peace, Leadership experience', 'Master''s degree or professional certificate in peace and conflict resolution at one of Rotary''s peace centers.', 'https://www.rotary.org/en/our-programs/peace-fellowships', 'Peace Studies', 'All Countries', 'Peace & Conflict Studies'),
('Microsoft Scholarship Program', 'Microsoft Corporation', '$5,000 per year', '2025-02-01', 'Computer Science or related major, Underrepresented groups', 'Scholarships for students pursuing degrees in computer science, computer engineering, or related STEM disciplines.', 'https://www.microsoft.com/en-us/diversity/programs/scholarships.aspx', 'STEM', 'All Countries', 'Computer Science, Engineering'),
('Joint Japan World Bank Graduate Scholarship', 'World Bank', 'Full Tuition + Living Allowance', '2025-03-31', 'Development-related studies, Developing country nationals', 'Scholarships for students from World Bank member countries to pursue development-related studies at selected universities worldwide including the U.S.', 'https://www.worldbank.org/en/programs/scholarships', 'Development Studies', 'Developing Countries', 'Economics, Public Policy'),
('Hubert Humphrey Fellowship Program', 'U.S. Department of State', 'Full Funding', '2025-09-01', 'Mid-career professionals, Non-U.S. citizens', 'Ten months of non-degree graduate-level study, leadership development, and professional collaboration with U.S. counterparts.', 'https://www.humphreyfellowship.org', 'Professional Development', 'All Countries', 'All Fields'),
('OPEC Fund for International Development', 'OPEC Fund', 'Full Tuition + Stipend', '2025-06-30', 'OPEC member or partner countries, Development-related fields', 'Scholarships for graduate-level studies in development-related fields.', 'https://opecfund.org/operations/how-to-apply/scholarship-program', 'Development Studies', 'OPEC Countries', 'Economics, Engineering'),
('ADB-Japan Scholarship Program', 'Asian Development Bank', 'Full Tuition + Living Expenses', '2025-07-31', 'Asian and Pacific countries nationals, Development-related fields', 'Scholarships for graduate studies in economics, management, science and technology, and other development-related fields at participating institutions.', 'https://www.adb.org/work-with-us/careers/japan-scholarship-program', 'Development Studies', 'Asia-Pacific', 'Economics, Engineering, Science'),
('P.E.O. International Peace Scholarship', 'P.E.O. Sisterhood', '$12,500', '2025-09-15', 'Women international students, Graduate/doctoral study', 'Scholarships for international women students to pursue graduate study in the U.S. or Canada.', 'https://www.peointernational.org/about-peo-international-peace-scholarship-ips', 'Women', 'All Countries', 'All Fields'),
('IFUW International Fellowships', 'International Federation of University Women', '$8,000 - $10,000', '2025-08-31', 'Women graduates, Advanced research or study', 'Fellowships and grants are available to women graduates from any country to pursue graduate study in any country other than their own.', 'https://www.ifuw.org/what-we-do/grants-fellowships/', 'Women', 'All Countries', 'All Fields'),
('Ford Foundation Fellowship Programs', 'Ford Foundation', 'Full Funding', '2025-12-15', 'Underrepresented minorities, Ph.D. or postdoctoral study', 'Fellowships for individuals who have experienced barriers to academic success and seek to increase diversity in college and university faculties.', 'https://sites.nationalacademies.org/pga/fordfellowships/', 'Diversity', 'U.S. Residents', 'All Fields'),
('Gates Cambridge Scholarship', 'Bill & Melinda Gates Foundation', 'Full Cost of Study', '2025-10-15', 'International students, Outstanding academic achievement', 'Scholarships for outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree at Cambridge (many recipients study in the U.S. after).', 'https://www.gatescambridge.org', 'Merit-Based', 'All Countries', 'All Fields'),
('Google Lime Scholarship', 'Google', '$10,000', '2025-12-01', 'Students with disabilities, Computer Science or related field', 'Scholarships for students with disabilities pursuing degrees in computer science, computer engineering, or related fields.', 'https://www.limeconnect.com/programs/page/google-lime-scholarship', 'Disability', 'All Countries', 'Computer Science'),
('Generation Google Scholarship', 'Google', '$10,000', '2025-12-01', 'Underrepresented groups in tech, Computer Science major', 'Scholarships for students who belong to historically underrepresented groups in computer science.', 'https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship/', 'Diversity', 'All Countries', 'Computer Science'),
('IBM Ph.D. Fellowship', 'IBM Corporation', '$35,000 per year', '2025-10-31', 'Ph.D. students in computer science or engineering', 'Fellowships recognizing exceptional Ph.D. students in computer science, electrical engineering, and related disciplines.', 'https://www.research.ibm.com/university/awards/fellowships.html', 'STEM', 'All Countries', 'Computer Science, Engineering'),
('AAAS Science & Technology Policy Fellowships', 'American Association for the Advancement of Science', '$80,000 - $100,000 stipend', '2025-11-01', 'Ph.D. in science or engineering, U.S. citizenship', 'Fellowships for Ph.D. scientists and engineers to work in the federal government and learn about science policy.', 'https://www.aaas.org/programs/science-technology-policy-fellowships', 'Science Policy', 'U.S. Citizens', 'Science, Engineering'),
('DAAD Graduate Scholarships', 'German Academic Exchange Service', '€861 per month + benefits', '2025-10-31', 'Graduate students, Study in Germany or U.S.', 'Scholarships for international students to pursue graduate studies in Germany or collaborative programs with U.S. institutions.', 'https://www.daad.org/en/', 'International Exchange', 'All Countries', 'All Fields'),
('Schwarzman Scholars Program', 'Schwarzman Scholars', 'Full Funding', '2025-09-21', 'Future leaders, One year master''s at Tsinghua', 'A one-year master''s program at Tsinghua University in Beijing designed to prepare future leaders for the geopolitical landscape of the 21st century.', 'https://www.schwarzmanscholars.org', 'Leadership', 'All Countries', 'All Fields'),
('Knight-Hennessy Scholars', 'Stanford University', 'Full Funding', '2025-10-10', 'Graduate study at Stanford, Leadership potential', 'A scholarship program at Stanford University that supports a multidisciplinary community of graduate students from around the world.', 'https://knight-hennessy.stanford.edu', 'Leadership', 'All Countries', 'All Fields'),
('Yale World Fellows Program', 'Yale University', 'Full Funding', '2025-11-15', 'Mid-career professionals, Demonstrated leadership', 'A four-month program for emerging global leaders from diverse sectors and countries to broaden perspectives and build leadership skills.', 'https://worldfellows.yale.edu', 'Leadership', 'All Countries', 'All Fields');
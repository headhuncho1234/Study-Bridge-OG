-- StudyBridge Scholarships Seed Data
-- 30 real scholarships covering diverse student profiles

INSERT INTO scholarships (
  id, title, provider, amount, deadline, min_gpa, eligible_majors,
  eligible_degree_levels, eligible_countries, financial_need_required,
  scholarship_type, tags, application_difficulty, required_essays, description
) VALUES

('sch-001', 'Gates Scholarship', 'Bill & Melinda Gates Foundation', '$40,000', '2026-09-15', 3.3,
  ARRAY['All Majors'], ARRAY['undergraduate'], ARRAY['United States'],
  true, 'merit-need', ARRAY['minority', 'low-income', 'first-generation'], 'high', 3,
  'Comprehensive scholarship for exceptional minority students with financial need.'),

('sch-002', 'Regeneron Science Talent Search', 'Society for Science', '$250,000', '2026-11-12', 3.5,
  ARRAY['Biology', 'Chemistry', 'Physics', 'Computer Science', 'Engineering'], ARRAY['undergraduate'],
  ARRAY['United States'], false, 'merit', ARRAY['stem', 'research'], 'high', 2,
  'Prestigious science and math competition for high school seniors pursuing STEM.'),

('sch-003', 'Google Generation Scholarship', 'Google', '$10,000', '2026-12-01', 3.2,
  ARRAY['Computer Science', 'Computer Engineering', 'Software Engineering'],
  ARRAY['undergraduate', 'graduate'], ARRAY['United States', 'Canada'],
  false, 'merit', ARRAY['women-in-tech', 'minority-in-tech', 'stem'], 'medium', 1,
  'Supporting underrepresented students pursuing computer science degrees.'),

('sch-004', 'Society of Women Engineers Scholarship', 'SWE', '$15,000', '2026-02-15', 3.0,
  ARRAY['Engineering', 'Computer Science', 'Engineering Technology'],
  ARRAY['undergraduate', 'graduate'], ARRAY['United States'],
  false, 'merit', ARRAY['women', 'stem', 'engineering'], 'medium', 2,
  'Supporting women pursuing ABET-accredited engineering or computer science programs.'),

('sch-005', 'NACME Scholarship', 'NACME', '$5,000', '2026-04-30', 2.8,
  ARRAY['Engineering', 'Computer Science'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['minority', 'african-american', 'hispanic', 'native-american', 'stem'], 'medium', 1,
  'Supporting underrepresented minorities pursuing engineering and computer science.'),

('sch-006', 'Robert Toigo Foundation Fellowship', 'Robert Toigo Foundation', '$8,000', '2026-03-01', 3.2,
  ARRAY['Business', 'Finance', 'MBA', 'Economics'], ARRAY['graduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['minority', 'african-american', 'hispanic', 'finance'], 'medium', 2,
  'Advancing underrepresented talent in finance and investing careers.'),

('sch-007', 'Hispanic Scholarship Fund', 'HSF', '$5,000', '2026-02-15', 3.0,
  ARRAY['All Majors'], ARRAY['undergraduate', 'graduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['hispanic', 'latino', 'minority'], 'low', 1,
  'Largest nonprofit organization supporting Hispanic American higher education.'),

('sch-008', 'Goldman Sachs Global Leaders Program', 'Goldman Sachs', '$11,000', '2026-10-01', 3.5,
  ARRAY['Business', 'Economics', 'Finance', 'Mathematics', 'Engineering'],
  ARRAY['undergraduate'], ARRAY['All Countries'],
  false, 'merit', ARRAY['international', 'leadership', 'finance'], 'high', 3,
  'Recognizing outstanding students with exceptional academic and leadership potential.'),

('sch-009', 'National Health Service Corps Scholarship', 'HRSA', '$50,000', '2026-03-30', 3.0,
  ARRAY['Medicine', 'Nursing', 'Dentistry', 'Mental Health'],
  ARRAY['graduate', 'doctoral'], ARRAY['United States'],
  false, 'service', ARRAY['healthcare', 'medicine', 'public-service'], 'high', 2,
  'Full tuition for healthcare students who commit to serving in underserved communities.'),

('sch-010', 'AMA Foundation Scholarship', 'AMA Foundation', '$10,000', '2026-05-01', 3.2,
  ARRAY['Medicine', 'Osteopathic Medicine'], ARRAY['graduate', 'doctoral'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['healthcare', 'medicine', 'minority'], 'medium', 2,
  'Supporting medical students demonstrating academic excellence and financial need.'),

('sch-011', 'Johnson & Johnson Nursing Scholarship', 'Johnson & Johnson', '$5,000', '2026-06-30', 3.0,
  ARRAY['Nursing'], ARRAY['undergraduate', 'graduate'],
  ARRAY['United States'], false, 'merit',
  ARRAY['nursing', 'healthcare', 'women'], 'low', 1,
  'Supporting the next generation of nursing professionals.'),

('sch-012', 'Fulbright Foreign Student Program', 'U.S. Department of State', '$35,000', '2026-10-15', 3.5,
  ARRAY['All Majors'], ARRAY['graduate', 'doctoral'],
  ARRAY['All Countries'], false, 'merit',
  ARRAY['international', 'research', 'cultural-exchange'], 'high', 3,
  'Full funding for international students to study and research in the United States.'),

('sch-013', 'Hubert H. Humphrey Fellowship', 'U.S. Department of State', '$30,000', '2026-10-01', 3.0,
  ARRAY['Public Policy', 'Public Health', 'Law', 'Education', 'Finance'],
  ARRAY['graduate'], ARRAY['All Countries'],
  false, 'merit', ARRAY['international', 'leadership', 'professional'], 'high', 2,
  'Non-degree program for experienced international professionals in the US.'),

('sch-014', 'AAUW International Fellowships', 'AAUW', '$20,000', '2026-11-15', 3.0,
  ARRAY['All Majors'], ARRAY['graduate', 'doctoral'],
  ARRAY['All Countries'], false, 'merit',
  ARRAY['women', 'international', 'research'], 'medium', 2,
  'For women who are not US citizens or permanent residents pursuing graduate study.'),

('sch-015', 'OAS Academic Scholarship Program', 'Organization of American States', '$15,000', '2026-03-15', 3.0,
  ARRAY['All Majors'], ARRAY['graduate', 'doctoral'],
  ARRAY['Latin America', 'Caribbean', 'Brazil', 'Mexico', 'Colombia', 'Argentina'],
  false, 'merit', ARRAY['international', 'latin-america'], 'medium', 1,
  'Promoting economic and educational development in OAS member states.'),

('sch-016', 'Thurgood Marshall College Fund Scholarship', 'TMCF', '$6,500', '2026-04-15', 3.0,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['african-american', 'minority', 'first-generation', 'hbcu'], 'medium', 2,
  'Supporting students attending Historically Black Colleges and Universities.'),

('sch-017', 'UNCF Scholarship', 'UNCF', '$8,000', '2026-03-01', 2.5,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['african-american', 'minority', 'low-income', 'first-generation'], 'low', 1,
  'The largest private provider of scholarships to Black students in the US.'),

('sch-018', 'Jack Kent Cooke Foundation Scholarship', 'Jack Kent Cooke Foundation', '$40,000', '2026-11-20', 3.5,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['first-generation', 'low-income', 'high-achieving'], 'high', 3,
  'For first-generation college students from low-income families with high academic promise.'),

('sch-019', 'APIASF Scholarship', 'APIASF', '$2,500', '2026-01-15', 2.7,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['asian-american', 'pacific-islander', 'minority', 'first-generation'], 'low', 1,
  'Providing scholarships to APIA students who are underserved and underrepresented.'),

('sch-020', 'American Indian College Fund Scholarship', 'American Indian College Fund', '$5,000', '2026-05-31', 2.5,
  ARRAY['All Majors'], ARRAY['undergraduate', 'graduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['native-american', 'indigenous', 'minority'], 'low', 1,
  'Supporting Native American students pursuing higher education.'),

('sch-021', 'ABA Legal Opportunity Scholarship', 'American Bar Association', '$15,000', '2026-03-01', 2.5,
  ARRAY['Law', 'Legal Studies'], ARRAY['graduate', 'doctoral'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['minority', 'law', 'first-generation'], 'medium', 2,
  'Supporting racial and ethnic minority students entering ABA-accredited law schools.'),

('sch-022', 'Paul & Daisy Soros Fellowships', 'PD Soros', '$90,000', '2026-11-01', 3.4,
  ARRAY['All Majors'], ARRAY['graduate'],
  ARRAY['United States'], false, 'merit',
  ARRAY['immigrant', 'international', 'new-american', 'leadership'], 'high', 3,
  'For immigrants and children of immigrants pursuing graduate study in the US.'),

('sch-023', 'TEACH Grant', 'U.S. Department of Education', '$4,000', '2026-06-01', 3.25,
  ARRAY['Education', 'Teaching'], ARRAY['undergraduate', 'graduate'],
  ARRAY['United States'], false, 'service',
  ARRAY['education', 'teaching', 'public-service'], 'low', 0,
  'For students who plan to teach full-time in high-need subject areas at low-income schools.'),

('sch-024', 'Milken Educator Award', 'Milken Family Foundation', '$25,000', '2026-09-01', 3.0,
  ARRAY['Education'], ARRAY['undergraduate', 'graduate'],
  ARRAY['United States'], false, 'merit',
  ARRAY['education', 'teaching', 'leadership'], 'medium', 1,
  'Recognizing excellence in education for early-to-mid career teachers.'),

('sch-025', 'Coca-Cola Scholars Program', 'Coca-Cola Foundation', '$20,000', '2026-10-31', 3.0,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], false, 'merit',
  ARRAY['leadership', 'community-service', 'all-majors'], 'high', 3,
  'Merit-based scholarship recognizing leadership and service in high school seniors.'),

('sch-026', 'Dell Scholars Program', 'Michael & Susan Dell Foundation', '$20,000', '2026-12-01', 2.4,
  ARRAY['All Majors'], ARRAY['undergraduate'],
  ARRAY['United States'], true, 'merit-need',
  ARRAY['low-income', 'first-generation', 'resilience'], 'medium', 2,
  'Supporting resilient students who have overcome significant challenges.'),

('sch-027', 'NSF Graduate Research Fellowship', 'National Science Foundation', '$37,000', '2026-10-15', 3.5,
  ARRAY['STEM', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Engineering', 'Psychology'],
  ARRAY['graduate', 'doctoral'], ARRAY['United States'],
  false, 'merit', ARRAY['research', 'stem', 'graduate'], 'high', 3,
  'Supporting outstanding graduate students in NSF-supported science and engineering fields.'),

('sch-028', 'Ford Foundation Fellowship', 'Ford Foundation', '$27,000', '2026-12-15', 3.5,
  ARRAY['All Majors'], ARRAY['doctoral'],
  ARRAY['United States'], false, 'merit',
  ARRAY['minority', 'diversity', 'research', 'doctoral'], 'high', 3,
  'Promoting diversity in academia through fellowships for doctoral students.'),

('sch-029', 'Echoing Green Fellowship', 'Echoing Green', '$80,000', '2026-01-15', 0.0,
  ARRAY['Business', 'Social Work', 'Public Policy', 'All Majors'], ARRAY['graduate', 'undergraduate'],
  ARRAY['All Countries'], false, 'merit',
  ARRAY['entrepreneurship', 'social-impact', 'leadership', 'innovation'], 'high', 3,
  'Supporting emerging social entrepreneurs launching bold solutions to global problems.'),

('sch-030', 'Halcyon Incubator Fellowship', 'Halcyon', '$75,000', '2026-02-01', 0.0,
  ARRAY['Business', 'Social Entrepreneurship', 'All Majors'], ARRAY['graduate', 'undergraduate'],
  ARRAY['All Countries'], false, 'merit',
  ARRAY['entrepreneurship', 'social-impact', 'innovation', 'startup'], 'high', 2,
  'Residential fellowship for social entrepreneurs tackling global challenges.')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  provider = EXCLUDED.provider,
  amount = EXCLUDED.amount,
  deadline = EXCLUDED.deadline,
  min_gpa = EXCLUDED.min_gpa,
  eligible_majors = EXCLUDED.eligible_majors,
  eligible_degree_levels = EXCLUDED.eligible_degree_levels,
  eligible_countries = EXCLUDED.eligible_countries,
  financial_need_required = EXCLUDED.financial_need_required,
  scholarship_type = EXCLUDED.scholarship_type,
  tags = EXCLUDED.tags,
  application_difficulty = EXCLUDED.application_difficulty,
  required_essays = EXCLUDED.required_essays,
  description = EXCLUDED.description;

SELECT COUNT(*) as total_scholarships FROM scholarships;

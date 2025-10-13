-- Create user scholarship preferences table
CREATE TABLE user_scholarship_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Academic Profile
  citizenship TEXT,
  gpa DECIMAL(3,2),
  major TEXT,
  degree_level TEXT,
  test_scores JSONB,
  
  -- Demographics & Background
  financial_need TEXT,
  demographics JSONB,
  
  -- Activities & Achievements
  activities JSONB,
  awards TEXT,
  
  -- Application Preferences
  timeline TEXT,
  essay_experience TEXT,
  preferred_scholarship_types JSONB,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_scholarship_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_scholarship_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_scholarship_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_scholarship_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user saved scholarships table
CREATE TABLE user_saved_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  
  -- Tracking
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  application_status TEXT DEFAULT 'saved',
  application_deadline DATE,
  notes TEXT,
  priority INTEGER DEFAULT 2,
  
  UNIQUE(user_id, scholarship_id)
);

-- Enable RLS
ALTER TABLE user_saved_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved scholarships"
  ON user_saved_scholarships FOR ALL
  USING (auth.uid() = user_id);

-- Update scholarships table with matching fields
ALTER TABLE scholarships 
  ADD COLUMN IF NOT EXISTS min_gpa DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS max_gpa DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS eligible_majors JSONB,
  ADD COLUMN IF NOT EXISTS eligible_degree_levels JSONB,
  ADD COLUMN IF NOT EXISTS eligible_countries JSONB,
  ADD COLUMN IF NOT EXISTS financial_need_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS scholarship_type TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB,
  ADD COLUMN IF NOT EXISTS required_essays INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_difficulty TEXT,
  ADD COLUMN IF NOT EXISTS estimated_time_hours INTEGER;

-- Index for fast matching queries
CREATE INDEX idx_scholarships_eligibility ON scholarships USING GIN (
  eligible_majors, eligible_degree_levels, eligible_countries, tags
);

-- Trigger for updated_at on preferences
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON user_scholarship_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
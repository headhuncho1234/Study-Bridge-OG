import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchFilters {
  minAmount?: number;
  maxAmount?: number;
  deadlineAfter?: string;
  scholarshipTypes?: string[];
}

interface UserProfile {
  citizenship: string;
  gpa: number;
  major: string;
  degree_level: string;
  test_scores: Record<string, number>;
  financial_need: string;
  demographics: string[];
  activities: string[];
  awards: string;
  timeline: string;
  essay_experience: string;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  min_gpa?: number;
  max_gpa?: number;
  eligible_majors?: string[];
  eligible_degree_levels?: string[];
  eligible_countries?: string[];
  financial_need_required?: boolean;
  scholarship_type?: string;
  tags?: string[];
  application_difficulty?: string;
  required_essays?: number;
}

function calculateDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateMatchScore(userProfile: UserProfile, scholarship: Scholarship): number {
  let score = 0;

  // GPA Match (25 points)
  if (scholarship.min_gpa && userProfile.gpa >= scholarship.min_gpa) {
    score += 25;
    // Bonus for exceeding by >0.3
    if (userProfile.gpa > scholarship.min_gpa + 0.3) {
      score += 5;
    }
  } else if (!scholarship.min_gpa) {
    score += 15; // Some points if no GPA requirement
  }

  // Major/Field Match (20 points)
  if (scholarship.eligible_majors?.includes(userProfile.major)) {
    score += 20;
  } else if (!scholarship.eligible_majors || scholarship.eligible_majors.length === 0) {
    score += 10; // Some points if no major restriction
  }

  // Citizenship Match (15 points)
  if (scholarship.eligible_countries?.includes(userProfile.citizenship)) {
    score += 15;
  } else if (!scholarship.eligible_countries || scholarship.eligible_countries.length === 0) {
    score += 10; // Some points if no country restriction
  }

  // Financial Need Match (15 points)
  if (scholarship.financial_need_required !== undefined) {
    const userHasNeed = userProfile.financial_need === 'high' || userProfile.financial_need === 'medium';
    if (scholarship.financial_need_required === userHasNeed) {
      score += 15;
    }
  } else {
    score += 7; // Neutral if not specified
  }

  // Demographics Match (10 points)
  if (scholarship.tags && userProfile.demographics) {
    const demographicMatches = userProfile.demographics.filter(
      d => scholarship.tags?.includes(d)
    );
    score += Math.min(demographicMatches.length * 5, 10);
  }

  // Deadline Urgency (10 points)
  const daysUntilDeadline = calculateDaysUntilDeadline(scholarship.deadline);
  if (daysUntilDeadline > 30 && daysUntilDeadline < 90) {
    score += 10;
  } else if (daysUntilDeadline >= 90) {
    score += 5;
  } else if (daysUntilDeadline < 14) {
    score -= 5; // Penalize very urgent deadlines
  }

  // Application Difficulty vs Essay Experience (5 points)
  if (userProfile.essay_experience === 'excellent' || 
      scholarship.application_difficulty === 'low') {
    score += 5;
  }

  return Math.min(Math.max(score, 0), 100);
}

function generateMatchReasons(userProfile: UserProfile, scholarship: Scholarship, score: number): string[] {
  const reasons: string[] = [];

  if (scholarship.min_gpa && userProfile.gpa >= scholarship.min_gpa) {
    reasons.push(`Your GPA (${userProfile.gpa}) meets the requirement (${scholarship.min_gpa})`);
  }

  if (scholarship.eligible_majors?.includes(userProfile.major)) {
    reasons.push(`Perfect match for ${userProfile.major} students`);
  }

  if (scholarship.eligible_countries?.includes(userProfile.citizenship)) {
    reasons.push(`Open to ${userProfile.citizenship} students`);
  }

  if (scholarship.tags && userProfile.demographics) {
    const matches = userProfile.demographics.filter(d => scholarship.tags?.includes(d));
    if (matches.length > 0) {
      reasons.push(`Matches your background: ${matches.join(', ')}`);
    }
  }

  if (scholarship.application_difficulty === 'low') {
    reasons.push('Quick and easy application process');
  }

  const daysUntil = calculateDaysUntilDeadline(scholarship.deadline);
  if (daysUntil > 30 && daysUntil < 90) {
    reasons.push('Good timing to start your application');
  }

  return reasons;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { userId, limit = 50, filters = {} } = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_scholarship_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scholarships
    let query = supabaseClient.from('scholarships').select('*');

    // Apply filters
    if (filters.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }
    if (filters.deadlineAfter) {
      query = query.gte('deadline', filters.deadlineAfter);
    }

    const { data: scholarships, error: scholarshipsError } = await query;

    if (scholarshipsError) {
      throw scholarshipsError;
    }

    // Calculate match scores
    const matches = scholarships
      .map(scholarship => {
        const score = calculateMatchScore(profile, scholarship);
        const reasons = generateMatchReasons(profile, scholarship, score);

        return {
          ...scholarship,
          match_score: score,
          match_reasons: reasons,
        };
      })
      .filter(match => match.match_score >= 30) // Only return matches with score >= 30
      .sort((a, b) => {
        // Primary: Match score
        if (b.match_score !== a.match_score) {
          return b.match_score - a.match_score;
        }
        // Secondary: Amount (parse as number)
        const amountA = parseInt(a.amount.replace(/[^0-9]/g, '')) || 0;
        const amountB = parseInt(b.amount.replace(/[^0-9]/g, '')) || 0;
        if (amountB !== amountA) {
          return amountB - amountA;
        }
        // Tertiary: Deadline (soonest first)
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, limit);

    return new Response(
      JSON.stringify({ matches, total: matches.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-scholarships:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

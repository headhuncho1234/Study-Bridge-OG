import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateDaysUntilDeadline(deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateMatchScore(userProfile, scholarship) {
    let score = 0;
    if (scholarship.min_gpa && userProfile.gpa >= scholarship.min_gpa) {
          score += 25;
          if (userProfile.gpa > scholarship.min_gpa + 0.3) score += 5;
    } else if (!scholarship.min_gpa) { score += 15; }
    if (scholarship.eligible_majors?.some(m => m === 'All Majors' || m === userProfile.major)) {
          score += 20;
    } else if (!scholarship.eligible_majors || scholarship.eligible_majors.length === 0) { score += 10; }
    if (scholarship.eligible_countries?.some(c => c === 'All Countries' || c === userProfile.citizenship)) {
          score += 15;
    } else if (!scholarship.eligible_countries || scholarship.eligible_countries.length === 0) { score += 10; }
    if (scholarship.financial_need_required !== undefined) {
          const userHasNeed = userProfile.financial_need === 'high' || userProfile.financial_need === 'medium';
          if (scholarship.financial_need_required === userHasNeed) score += 15;
    } else { score += 7; }
    if (scholarship.eligible_degree_levels?.includes(userProfile.degree_level)) {
          score += 10;
    } else if (!scholarship.eligible_degree_levels || scholarship.eligible_degree_levels.length === 0) { score += 5; }
    if (scholarship.tags && userProfile.demographics) {
          const matches = userProfile.demographics.filter(d => scholarship.tags?.includes(d));
          score += Math.min(matches.length * 5, 10);
    }
    const days = calculateDaysUntilDeadline(scholarship.deadline);
    if (days > 30 && days < 90) score += 10;
    else if (days >= 90) score += 5;
    else if (days < 14) score -= 5;
    if (userProfile.essay_experience === 'excellent' || scholarship.application_difficulty === 'low') score += 5;
    return Math.min(Math.max(score, 0), 100);
}

function generateMatchReasons(userProfile, scholarship) {
    const reasons = [];
    if (scholarship.min_gpa && userProfile.gpa >= scholarship.min_gpa) {
          reasons.push('Your GPA (' + userProfile.gpa + ') meets the requirement (' + scholarship.min_gpa + ')');
    }
    if (scholarship.eligible_majors?.includes(userProfile.major)) {
          reasons.push('Perfect match for ' + userProfile.major + ' students');
    } else if (scholarship.eligible_majors?.includes('All Majors')) {
          reasons.push('Open to all majors');
    }
    if (scholarship.eligible_countries?.includes(userProfile.citizenship)) {
          reasons.push('Open to ' + userProfile.citizenship + ' students');
    } else if (scholarship.eligible_countries?.includes('All Countries')) {
          reasons.push('Open to international students');
    }
    if (scholarship.tags && userProfile.demographics) {
          const matches = userProfile.demographics.filter(d => scholarship.tags?.includes(d));
          if (matches.length > 0) reasons.push('Matches your background: ' + matches.join(', '));
    }
    if (scholarship.application_difficulty === 'low') reasons.push('Quick and easy application process');
    const days = calculateDaysUntilDeadline(scholarship.deadline);
    if (days > 30 && days < 90) reasons.push('Good timing to start your application now');
    return reasons;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    try {
          const supabaseClient = createClient(
                  Deno.env.get('SUPABASE_URL') ?? '',
                  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization') } } }
                );

      const { userId, limit = 50, filters = {} } = await req.json();

      // Fetch all scholarships
      let query = supabaseClient.from('scholarships').select('*');
          if (filters.minAmount) query = query.gte('amount', filters.minAmount);
          if (filters.deadlineAfter) query = query.gte('deadline', filters.deadlineAfter);
          const { data: scholarships, error: scholarshipsError } = await query;
          if (scholarshipsError) throw scholarshipsError;

      // Try to get user profile for personalized matching
      let profile = null;
          if (userId) {
                  const { data: profileData } = await supabaseClient
                    .from('user_scholarship_preferences').select('*').eq('user_id', userId).single();
                  profile = profileData;
          }

      let matches = [];

      if (profile && scholarships && scholarships.length > 0) {
              // Personalized matching
            matches = scholarships
                .map(s => ({ ...s, match_score: calculateMatchScore(profile, s), match_reasons: generateMatchReasons(profile, s) }))
                .filter(m => m.match_score >= 30)
                .sort((a, b) => {
                            if (b.match_score !== a.match_score) return b.match_score - a.match_score;
                            const aAmt = parseInt(a.amount.replace(/[^0-9]/g, '')) || 0;
                            const bAmt = parseInt(b.amount.replace(/[^0-9]/g, '')) || 0;
                            if (bAmt !== aAmt) return bAmt - aAmt;
                            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                })
                .slice(0, limit);
      } else if (scholarships && scholarships.length > 0) {
              // No profile — return all scholarships sorted by amount
            matches = scholarships
                .map(s => ({ ...s, match_score: 75, match_reasons: ['Open to all eligible students'] }))
                .sort((a, b) => {
                            const aAmt = parseInt(a.amount.replace(/[^0-9]/g, '')) || 0;
                            const bAmt = parseInt(b.amount.replace(/[^0-9]/g, '')) || 0;
                            return bAmt - aAmt;
                })
                .slice(0, limit);
      }

      return new Response(JSON.stringify({ matches, total: matches.length }),
                          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
          console.error('Error in match-scholarships:', error);
          return new Response(JSON.stringify({ error: error.message, matches: [] }),
                              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});

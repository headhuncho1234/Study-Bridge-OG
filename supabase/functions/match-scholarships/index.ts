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
  eligible_majors?: string[];
  eligible_degree_levels?: string[];
  eligible_countries?: string[];
  financial_need_required?: boolean;
  scholarship_type?: string;
  tags?: string[];
  application_difficulty?: string;
  required_essays?: number;
  description?: string;
}

function calculateDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateMatchScore(userProfile: UserProfile, scholarship: Scholarship): number {
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

function generateMatchReasons(userProfile: UserProfile, scholarship: Scholarship): string[] {
  const reasons: string[] = [];
  if (scholarship.min_gpa && userProfile.gpa >= scholarship.min_gpa) {
    reasons.push("Your GPA (" + userProfile.gpa + ") meets the requirement (" + scholarship.min_gpa + ")");
  }
  if (scholarship.eligible_majors?.includes(userProfile.major)) {
    reasons.push("Perfect match for " + userProfile.major + " students");
  } else if (scholarship.eligible_majors?.includes('All Majors')) {
    reasons.push('Open to all majors');
  }
  if (scholarship.eligible_countries?.includes(userProfile.citizenship)) {
    reasons.push("Open to " + userProfile.citizenship + " students");
  } else if (scholarship.eligible_countries?.includes('All Countries')) {
    reasons.push('Open to international students');
  }
  if (scholarship.tags && userProfile.demographics) {
    const matches = userProfile.demographics.filter(d => scholarship.tags?.includes(d));
    if (matches.length > 0) reasons.push("Matches your background: " + matches.join(', '));
  }
  if (scholarship.application_difficulty === 'low') reasons.push('Quick and easy application process');
  const days = calculateDaysUntilDeadline(scholarship.deadline);
  if (days > 30 && days < 90) reasons.push('Good timing to start your application now');
  return reasons;
}

async function getAIFallbackMatches(profile: UserProfile): Promise<any[]> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  if (!anthropicKey && !openAIKey) return [];
  const prompt = "You are a scholarship matching expert. Based on this student profile, return 8 real scholarship matches as JSON only. No markdown, no explanation.\n\nProfile: Citizenship: " + profile.citizenship + ", GPA: " + profile.gpa + ", Major: " + profile.major + ", Degree: " + profile.degree_level + ", Financial Need: " + profile.financial_need + ", Demographics: " + (profile.demographics||[]).join(', ') + "\n\nReturn ONLY this JSON:\n{\"matches\":[{\"id\":\"ai-1\",\"title\":\"Scholarship Name\",\"provider\":\"Organization\",\"amount\":\"$5,000\",\"deadline\":\"2026-06-01\",\"match_score\":85,\"eligibility\":\"Requirements\",\"application_difficulty\":\"Medium\",\"required_essays\":1,\"application_link\":\"https://example.com\",\"match_reasons\":[\"Reason 1\"],\"description\":\"Description\"}]}";
  try {
    let aiText = '';
    if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      aiText = data.content?.[0]?.text || '';
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: "Bearer " + openAIKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
      });
      const data = await res.json();
      aiText = data.choices?.[0]?.message?.content || '';
    }
    const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned).matches || [];
  } catch (e) {
    console.error('AI fallback failed:', e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { userId, limit = 50, filters = {} } = await req.json();
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_scholarship_preferences').select('*').eq('user_id', userId).single();
    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let query = supabaseClient.from('scholarships').select('*');
    if (filters.minAmount) query = query.gte('amount', filters.minAmount);
    if (filters.deadlineAfter) query = query.gte('deadline', filters.deadlineAfter);
    const { data: scholarships, error: scholarshipsError } = await query;
    if (scholarshipsError) throw scholarshipsError;
    let matches: any[] = [];
    if (scholarships && scholarships.length > 0) {
      matches = scholarships
        .map((s: Scholarship) => ({ ...s, match_score: calculateMatchScore(profile, s), match_reasons: generateMatchReasons(profile, s) }))
        .filter((m: any) => m.match_score >= 30)
        .sort((a: any, b: any) => {
          if (b.match_score !== a.match_score) return b.match_score - a.match_score;
          const aAmt = parseInt(a.amount.replace(/[^0-9]/g, '')) || 0;
          const bAmt = parseInt(b.amount.replace(/[^0-9]/g, '')) || 0;
          if (bAmt !== aAmt) return bAmt - aAmt;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        })
        .slice(0, limit);
    }
    if (matches.length < 5) {
      console.log("DB returned " + matches.length + " matches — using AI fallback");
      const aiMatches = await getAIFallbackMatches(profile);
      const existingTitles = new Set(matches.map((m: any) => m.title));
      matches = [...matches, ...aiMatches.filter((m: any) => !existingTitles.has(m.title))].slice(0, limit);
    }
    return new Response(JSON.stringify({ matches, total: matches.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in match-scholarships:', error);
    return new Response(JSON.stringify({ error: error.message, matches: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

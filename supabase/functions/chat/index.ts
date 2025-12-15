import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_TIMEOUT = 25000; // 25 seconds
const MAX_RETRIES = 2;

// Simple in-memory rate limiting for unauthenticated requests
// In production, consider using Redis or a database
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const GUEST_RATE_LIMIT = 10; // 10 requests per minute for guests
const AUTH_RATE_LIMIT = 30; // 30 requests per minute for authenticated users

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(key: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Check for authenticated user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      
      // Use the anon key token to get user
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (user && !authError) {
        userId = user.id;
        isAuthenticated = true;
        console.log('Authenticated request from user:', userId);
      }
    }

    // Apply rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = isAuthenticated ? `user:${userId}` : `ip:${clientIP}`;
    const rateLimit = isAuthenticated ? AUTH_RATE_LIMIT : GUEST_RATE_LIMIT;
    
    const { allowed, remaining } = checkRateLimit(rateLimitKey, rateLimit);
    
    if (!allowed) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a minute.',
          error_type: 'RATE_LIMIT'
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          } 
        }
      );
    }

    const { message, context, session_history, user_profile } = await req.json();
    
    // Log request for audit trail
    console.log(`Chat request: authenticated=${isAuthenticated}, ip=${clientIP}, message_length=${message?.length || 0}`);
    
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Message is required',
          error_type: 'EMPTY_INPUT'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received message for chat, length:', message.length);

    // Check if this is a structured matching request
    const isStructuredMatching = message.includes('questionnaire data') || message.includes('JSON') || message.includes('matches') || message.includes('scholarship') || message.includes('housing') || message.includes('visa');
    
    // Homepage assistant context
    const isHomepageAssistant = context === 'homepage_assistant';
    
    const systemPrompt = isStructuredMatching 
      ? `You are a university matching AI that generates personalized university search results for international students. 

CRITICAL: You MUST return results in the exact JSON format specified below. Each university result MUST include ALL required fields:

- name: Full official name of the university
- location: City, State (e.g., "Austin, TX")
- ranking: Ranking text (e.g., "#38 National Universities") 
- tuition: Annual tuition as a string (e.g., "$41,998/year")
- acceptance_rate: Acceptance rate with % (e.g., "31.8%")
- difficulty: One of ["Low", "Moderate", "High", "Very High"]
- student_body: Approximate number of enrolled students (integer)
- description: 1–2 sentence summary of the school
- programs: Array of top program areas (e.g., ["Engineering", "Business", "Liberal Arts"])
- school_scholarships: Object with merit_scholarships array containing objects with name, amount, and eligibility
- website: Official university website (if available)
- personalized_summary: A short explanation of why this school matches the student's preferences

Return ONLY valid JSON array of 2-3 university matches in this format:
[
  {
    "name": "University of Texas Austin",
    "location": "Austin, TX",
    "ranking": "#38 National Universities",
    "tuition": "$41,998/year",
    "acceptance_rate": "31.8%",
    "difficulty": "Moderate",
    "student_body": 52000,
    "description": "Large public research university with strong programs.",
    "programs": ["Engineering", "Business", "Liberal Arts", "Natural Sciences"],
    "school_scholarships": {
      "merit_scholarships": [
        { "name": "UT Scholarship", "amount": "$15,000", "eligibility": "Merit-based" }
      ]
    },
    "website": "https://www.utexas.edu",
    "personalized_summary": "Strong in your preferred field of engineering and generous scholarships."
  }
]

Do NOT return plain text, tables, or markdown. Only return valid JSON following this schema.`
      : 'You are StudyBridge, a friendly and knowledgeable AI assistant for international students. Help with questions about studying in the U.S., including applications, scholarships, visas, housing, student life, and general guidance. Be helpful, encouraging, and provide practical advice. Keep responses conversational and supportive.';

    let lastError: Error | null = null;
    let assistantMessage = '';

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT);

        console.log(`OpenAI API call attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: systemPrompt
              },
              ...(session_history || []),
              { role: 'user', content: message }
            ],
            max_tokens: isHomepageAssistant ? 800 : 4000,
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          console.error('OpenAI API error:', response.status, response.statusText, errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Invalid OpenAI response structure:', data);
          throw new Error('Invalid response from AI service');
        }

        assistantMessage = data.choices[0].message.content;
        console.log('OpenAI response received successfully');

        // Only validate JSON for structured matching requests
        if (isStructuredMatching) {
          try {
            const jsonStart = assistantMessage.indexOf('{');
            const jsonEnd = assistantMessage.lastIndexOf('}') + 1;
            
            if (jsonStart === -1 || jsonEnd === 0) {
              throw new Error('No JSON found in response');
            }
            
            const jsonString = assistantMessage.substring(jsonStart, jsonEnd);
            const parsedJson = JSON.parse(jsonString);
            
            // Validate required fields for different result types
            if (parsedJson.matches && Array.isArray(parsedJson.matches)) {
              console.log('University matches validation successful:', parsedJson.matches.length);
            } else if (parsedJson.scholarships && Array.isArray(parsedJson.scholarships)) {
              console.log('Scholarship matches validation successful:', parsedJson.scholarships.length);
            } else if (parsedJson.housing_options && Array.isArray(parsedJson.housing_options)) {
              console.log('Housing options validation successful:', parsedJson.housing_options.length);
            } else if (parsedJson.profile || parsedJson.roadmap) {
              console.log('Visa guidance validation successful');
            } else {
              throw new Error('Invalid JSON structure: missing expected data arrays or objects');
            }
          } catch (jsonError) {
            console.error('JSON validation warning:', jsonError);
            // Don't throw error, just log the warning and continue
            console.log('Proceeding with potentially imperfect JSON structure');
          }
        }
        
        return new Response(
          JSON.stringify({ message: assistantMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);

        // If it's a timeout and not the last attempt, retry
        if (error.name === 'AbortError' && attempt < MAX_RETRIES) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // 1s, 2s
          console.log(`Retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }

        // If it's the last attempt or non-timeout error, break
        if (attempt === MAX_RETRIES || error.name !== 'AbortError') {
          break;
        }
      }
    }

    // If all retries failed, return timeout response
    console.error('All retry attempts failed:', lastError);
    return new Response(
      JSON.stringify({ 
        error: 'Request timeout',
        error_type: 'TIMEOUT',
        message: "I'm taking longer than expected to respond. Please try asking your question again."
      }),
      { 
        status: 504, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    
    // Determine error type for better frontend handling
    let errorType = 'INTERNAL_ERROR';
    let statusCode = 500;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'NETWORK_ERROR';
      statusCode = 503;
    } else if (errorMessage.includes('JSON')) {
      errorType = 'JSON_PARSE';
      statusCode = 422;
    } else if (errorMessage.includes('API key')) {
      errorType = 'AUTH';
      statusCode = 401;
    } else if (error.name === 'AbortError') {
      errorType = 'TIMEOUT';
      statusCode = 504;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        error_type: errorType,
        details: errorMessage 
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

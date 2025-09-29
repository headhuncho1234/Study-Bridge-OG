import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { message, context, session_history, user_profile } = await req.json();
    
    if (!message) {
      console.error('Message is required');
      throw new Error('Message is required');
    }

    console.log('Received message for chat, length:', message.length);

    // Check if this is a structured matching request (contains schema/JSON instructions)
    const isStructuredMatching = message.includes('questionnaire data') || message.includes('JSON') || message.includes('matches') || message.includes('scholarship') || message.includes('housing') || message.includes('visa');
    
    // Homepage assistant context
    const isHomepageAssistant = context === 'homepage_assistant';
    
const systemPrompt = isStructuredMatching 
      ? `You are StudyBridge AI, a specialized assistant for international students studying in the U.S. You generate comprehensive JSON responses for matching requests.

For UNIVERSITY matches, ALWAYS use this exact JSON format with all required fields:
{
  "profile": "Brief summary of the student's academic profile and preferences",
  "matches": [
    {
      "name": "University Name",
      "location": "City, State",
      "match_score": 85,
      "tuition": "$45,000/year (out-of-state)",
      "acceptance_rate": "65%",
      "ranking": "#50 Public Universities (U.S. News 2024)",
      "programs": ["Computer Science", "Engineering", "Business"],
      "campus_size": "25,000 students",
      "student_body": 25000,
      "description": "Brief description of what makes this university special",
      "application_deadline": "January 15, 2024",  
      "requirements": ["SAT: 1200+", "GPA: 3.5+", "Essays required"],
      "website": "https://www.university.edu",
      "personalized_summary": "This university is perfect for you because it offers strong programs in your chosen field with excellent research opportunities and matches your preference for a large campus environment.",
      "detailed_info": {
        "campus_life": "Vibrant campus with 300+ student organizations",
        "research_opportunities": "Undergraduate research programs available",
        "career_services": "95% job placement rate within 6 months",
        "notable_alumni": ["Famous Person", "Another Notable Graduate"],
        "student_faculty_ratio": "15:1",
        "retention_rate": "92%",
        "graduation_rate": "85%",
        "facilities": ["Modern labs", "Recreation center", "Library complex"]
      },
      "school_scholarships": {
        "merit_scholarships": [
          {
            "name": "Presidential Scholarship",
            "amount": "$15,000/year",
            "eligibility": "GPA 3.8+, SAT 1400+",
            "deadline": "December 1, 2024",
            "renewable": true,
            "application_link": "https://www.university.edu/scholarships/presidential"
          }
        ],
        "need_based": [
          {
            "name": "Access Grant",
            "amount": "Up to $8,000/year",
            "eligibility": "Based on FAFSA, family income under $60k",
            "deadline": "March 1, 2024",
            "renewable": true,
            "application_link": "https://www.university.edu/financial-aid/grants"
          }
        ],
        "program_specific": [
          {
            "name": "Engineering Excellence Award",
            "amount": "$5,000/year",
            "eligibility": "Engineering majors, GPA 3.5+",
            "deadline": "February 15, 2024",
            "renewable": true,
            "application_link": "https://www.university.edu/engineering/scholarships"
          }
        ]
      }
    }
  ]
}

CRITICAL: Always return exactly 5-7 university matches. Include accurate U.S. News public university rankings, realistic tuition costs, acceptance rates, student body numbers, working .edu website URLs, personalized summaries, detailed campus information, and 3-5 school-specific scholarships per university organized by type (merit, need-based, program-specific). Focus only on legitimate U.S. institutions.`
      : 'You are StudyBridge, a friendly and knowledgeable AI assistant for international students. Help with questions about studying in the U.S., including applications, scholarships, visas, housing, student life, and general guidance. Be helpful, encouraging, and provide practical advice. Keep responses conversational and supportive.';

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
    });

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

    const aiResponse = data.choices[0].message.content;
    console.log('AI response generated successfully, length:', aiResponse.length);

    // Only validate JSON for structured matching requests
    if (isStructuredMatching) {
      try {
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No JSON found in response');
        }
        
        const jsonString = aiResponse.substring(jsonStart, jsonEnd);
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
        console.error('JSON validation error:', jsonError);
        const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown JSON error';
        throw new Error(`Invalid JSON response: ${errorMessage}`);
      }
    }

    return new Response(JSON.stringify({ message: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in chat function:', error);
    
    // Return different error types for better frontend handling
    let errorType = 'unknown';
    let statusCode = 500;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'network';
      statusCode = 503;
    } else if (errorMessage.includes('JSON')) {
      errorType = 'json_parse';
      statusCode = 422;
    } else if (errorMessage.includes('API key')) {
      errorType = 'auth';
      statusCode = 401;
    } else if (errorMessage.includes('timeout')) {
      errorType = 'timeout';
      statusCode = 408;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate university matches',
      error_type: errorType,
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
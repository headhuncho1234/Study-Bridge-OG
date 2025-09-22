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

    const { message } = await req.json();
    
    if (!message) {
      console.error('Message is required');
      throw new Error('Message is required');
    }

    console.log('Received message for university matching, length:', message.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a university matching AI assistant for U.S. students called StudyBridge. You generate JSON responses for university matching. Always return valid JSON matching the requested schema. Focus only on U.S. universities and colleges. Be accurate and helpful with university recommendations based on student profiles.' 
          },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.3,
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

    // Validate JSON response
    try {
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }
      
      const jsonString = aiResponse.substring(jsonStart, jsonEnd);
      const parsedJson = JSON.parse(jsonString);
      
      // Validate required fields
      if (!parsedJson.matches || !Array.isArray(parsedJson.matches)) {
        throw new Error('Invalid JSON structure: missing matches array');
      }
      
      console.log('JSON validation successful, matches found:', parsedJson.matches.length);
    } catch (jsonError) {
      console.error('JSON validation error:', jsonError);
      throw new Error(`Invalid JSON response: ${jsonError.message}`);
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in chat function:', error);
    
    // Return different error types for better frontend handling
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
      statusCode = 503;
    } else if (error.message.includes('JSON')) {
      errorType = 'json_parse';
      statusCode = 422;
    } else if (error.message.includes('API key')) {
      errorType = 'auth';
      statusCode = 401;
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
      statusCode = 408;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate university matches',
      error_type: errorType,
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
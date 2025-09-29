import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { name, country } = await req.json();
    console.log(`School info request: ${name} (${country})`);

    const schoolData = {
      name,
      location: country || 'Data unavailable',
      tuition: 'Data unavailable',
      campusSize: 'Data unavailable', 
      enrollment: 'Data unavailable',
      acceptanceRate: 'Data unavailable',
      details: 'Data unavailable',
      officialUrl: 'Data unavailable',
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + (country || '') + ' university official website')}`,
      lastFetched: new Date().toISOString()
    };

    // Try to find official website
    try {
      const searchQuery = `${name} ${country || ''} university official website`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      // For demonstration, we'll use some sample data for known universities
      const knownUniversities: Record<string, any> = {
        'university of georgia': {
          tuition: '$12,080 (in-state), $31,120 (out-of-state)',
          campusSize: '2,450 acres',
          enrollment: '40,118 students', 
          acceptanceRate: '48%',
          details: 'Public research university founded in 1785, known for strong programs in business, journalism, and agriculture.',
          officialUrl: 'https://www.uga.edu',
          sourceUrl: 'https://www.uga.edu/about/facts/'
        },
        'harvard university': {
          tuition: '$57,261',
          campusSize: '5,076 acres',
          enrollment: '23,731 students',
          acceptanceRate: '3.4%',
          details: 'Private Ivy League research university founded in 1636, oldest institution of higher education in the United States.',
          officialUrl: 'https://www.harvard.edu',
          sourceUrl: 'https://www.harvard.edu/about/fact-and-figures/'
        },
        'massachusetts institute of technology': {
          tuition: '$59,750',
          campusSize: '168 acres',
          enrollment: '11,858 students',
          acceptanceRate: '4.7%',
          details: 'Private research university focused on science, technology, engineering, and mathematics.',
          officialUrl: 'https://web.mit.edu',
          sourceUrl: 'https://web.mit.edu/facts/'
        },
        'mit': {
          tuition: '$59,750',
          campusSize: '168 acres',
          enrollment: '11,858 students',
          acceptanceRate: '4.7%',
          details: 'Private research university focused on science, technology, engineering, and mathematics.',
          officialUrl: 'https://web.mit.edu',
          sourceUrl: 'https://web.mit.edu/facts/'
        },
        'stanford university': {
          tuition: '$61,731',
          campusSize: '8,180 acres',
          enrollment: '17,381 students',
          acceptanceRate: '3.9%',
          details: 'Private research university known for its entrepreneurial character and proximity to Silicon Valley.',
          officialUrl: 'https://www.stanford.edu',
          sourceUrl: 'https://facts.stanford.edu/'
        },
        'yale university': {
          tuition: '$62,250',
          campusSize: '1,015 acres',
          enrollment: '13,609 students',
          acceptanceRate: '4.6%',
          details: 'Private Ivy League research university known for its dramatic arts, music, and art programs.',
          officialUrl: 'https://www.yale.edu',
          sourceUrl: 'https://www.yale.edu/about-yale/yale-facts'
        }
      };

      const schoolKey = name.toLowerCase().trim();
      const knownData = knownUniversities[schoolKey];

      if (knownData) {
        Object.assign(schoolData, knownData);
        console.log(`Found data for known university: ${name}`);
      } else {
        console.log(`No known data for ${name}, using fallback search links`);
        // For unknown universities, provide search links and mark missing data
        schoolData.officialUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' official website')}`;
        schoolData.sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + (country || '') + ' university facts')}`;
      }
    } catch (searchError) {
      console.error('Error in school search:', searchError);
    }

    return new Response(JSON.stringify(schoolData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in school-info function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch school information',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
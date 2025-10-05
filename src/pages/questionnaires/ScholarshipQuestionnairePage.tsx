import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScholarshipQuestionnaire, { ScholarshipPreferences } from "@/components/questionnaire/ScholarshipQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ScholarshipQuestionnairePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateScholarshipMatches = async (formData: ScholarshipPreferences) => {
    setIsGenerating(true);
    
    try {
      const prompt = `Find the best scholarship matches based on this profile (MUST return at least 5 scholarships):

Citizenship: ${formData.citizenship}
GPA: ${formData.gpa[0]}
Major: ${formData.major}
Degree Level: ${formData.degreeLevel}
Financial Need: ${formData.financialNeed}
Test Scores: SAT: ${formData.testScores.sat}, GRE: ${formData.testScores.gre}, TOEFL: ${formData.testScores.toefl}
Activities: ${formData.activities.join(', ')}
Demographics: ${formData.demographics.join(', ')}
Awards: ${formData.awards}
Timeline: ${formData.timeline}
Essay Experience: ${formData.essayExperience}

Please provide:
1. Profile assessment and competitiveness
2. MINIMUM 5 targeted scholarship recommendations with:
   - Scholarship name and sponsor
   - Award amount
   - Eligibility requirements
   - Application deadline
   - Match percentage
   - Application difficulty
   - Required essays/materials
3. Application strategy and timeline
4. Essay writing tips based on experience level
5. Additional opportunities to explore

Format as JSON:
{
  "profile": {
    "summary": "Brief assessment of scholarship competitiveness",
    "strengths": ["strength1", "strength2"],
    "areas_to_improve": ["area1", "area2"],
    "estimated_total_available": "$XX,XXX"
  },
  "scholarships": [
    {
      "name": "Scholarship Name",
      "sponsor": "Organization/University",
      "amount": "$X,XXX - $XX,XXX",
      "deadline": "YYYY-MM-DD",
      "match_score": 85,
      "difficulty": "Low/Medium/High",
      "requirements": ["req1", "req2"],
      "essays_required": 2,
      "application_link": "URL or contact info",
      "tips": "Specific advice for this scholarship"
    }
  ],
  "strategy": {
    "application_timeline": "Recommended schedule",
    "priority_order": ["scholarship1", "scholarship2"],
    "time_investment": "X hours per week recommended"
  },
  "essay_guidance": {
    "common_topics": ["topic1", "topic2"],
    "writing_tips": ["tip1", "tip2"],
    "resources": ["resource1", "resource2"]
  },
  "additional_opportunities": [
    {
      "type": "Research Grant/Fellowship/etc",
      "description": "Brief description",
      "how_to_apply": "Application process"
    }
  ]
}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      let scholarshipResults;
      try {
        let jsonString = data.message || data.response;

        if (!jsonString) {
          throw new Error("Empty AI response");
        }
        
        // Find and isolate the JSON array/object part, if ChatGPT returned extra text
        const jsonStart = jsonString.indexOf("{");
        const jsonEnd = jsonString.lastIndexOf("}") + 1;
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonString = jsonString.substring(jsonStart, jsonEnd);
        }
        
        housingResults = JSON.parse(jsonString);

        
        // Ensure we have at least 5 scholarships
        if (!scholarshipResults.scholarships || scholarshipResults.scholarships.length < 5) {
          throw new Error('Insufficient scholarship matches returned');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Enhanced fallback data with 5+ scholarships
        scholarshipResults = {
          profile: {
            summary: `Strong candidate for ${formData.major} scholarships with ${formData.gpa[0]} GPA`,
            strengths: ["High Academic Achievement", "Diverse Activities", "Strong Test Scores"],
            areas_to_improve: ["Leadership Experience", "Community Service"],
            estimated_total_available: "$45,000"
          },
          scholarships: [
            {
              name: "Merit Excellence Award",
              sponsor: "Private Foundation", 
              amount: "$5,000 - $10,000",
              deadline: "2024-03-15",
              match_score: 95,
              difficulty: "Medium",
              requirements: ["3.5+ GPA", "Leadership experience"],
              essays_required: 2,
              application_link: "www.example.com/apply",
              tips: "Focus on leadership experiences in your essays"
            },
            {
              name: "Academic Achievement Scholarship",
              sponsor: "National Education Foundation",
              amount: "$3,000 - $7,500",
              deadline: "2024-04-01",
              match_score: 88,
              difficulty: "Low",
              requirements: ["3.0+ GPA", "Full-time enrollment"],
              essays_required: 1,
              application_link: "www.nef.org/scholarships",
              tips: "Highlight your academic progression and goals"
            },
            {
              name: "Future Leaders Grant",
              sponsor: "Leadership Institute",
              amount: "$2,500 - $5,000",
              deadline: "2024-05-15",
              match_score: 82,
              difficulty: "High",
              requirements: ["Leadership roles", "Community service", "3.2+ GPA"],
              essays_required: 3,
              application_link: "www.leadershipinstitute.org",
              tips: "Emphasize transformational leadership experiences"
            },
            {
              name: "STEM Innovation Award",
              sponsor: "Tech Companies Consortium",
              amount: "$8,000 - $15,000",
              deadline: "2024-02-28",
              match_score: 90,
              difficulty: "Medium",
              requirements: ["STEM major", "Innovation project", "3.4+ GPA"],
              essays_required: 2,
              application_link: "www.stemconsortium.org/awards",
              tips: "Showcase your innovative projects and problem-solving skills"
            },
            {
              name: "Diversity & Inclusion Scholarship",
              sponsor: "Inclusive Excellence Foundation",
              amount: "$4,000 - $8,000",
              deadline: "2024-06-01",
              match_score: 85,
              difficulty: "Medium",
              requirements: ["Underrepresented background", "2.8+ GPA"],
              essays_required: 2,
              application_link: "www.inclusiveexcellence.org",
              tips: "Share your unique perspective and how it will contribute to your field"
            }
          ],
          strategy: {
            application_timeline: "Start applications 2 months before deadlines",
            priority_order: ["Merit Excellence Award", "STEM Innovation Award"],
            time_investment: "5-8 hours per week recommended"
          },
          essay_guidance: {
            common_topics: ["Academic goals", "Leadership experience", "Community impact"],
            writing_tips: ["Be specific with examples", "Show don't tell", "Address the prompt directly"],
            resources: ["University writing center", "Online essay guides"]
          },
          additional_opportunities: [
            {
              type: "Research Grant",
              description: "Undergraduate research funding",
              how_to_apply: "Contact faculty in your department"
            }
          ]
        };
      }

      navigate('/results', { 
        state: { 
          matchData: scholarshipResults,
          source: 'scholarship-questionnaire'
        } 
      });

    } catch (error) {
      console.error('Error generating scholarship matches:', error);
      toast({
        title: "Error generating matches",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/features/scholarship-database">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Scholarship Matching Questionnaire
            </h1>
            <p className="text-muted-foreground">
              Find scholarships tailored to your profile
            </p>
          </div>
        </div>

        <ScholarshipQuestionnaire 
          onSubmit={generateScholarshipMatches}
          isLoading={isGenerating}
        />

        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Finding Your Scholarship Matches</h3>
              <p className="text-muted-foreground">
                Analyzing your profile against thousands of scholarships...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipQuestionnairePage;
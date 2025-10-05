import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, University } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QuestionnaireForm from "./questionnaire/QuestionnaireForm";

interface QuestionnaireData {
  major: string;
  customMajor?: string;
  gpa: string;
  preferredLocation: string[];
  budget: string;
  campusSize: string;
  enrollmentType: string;
  extracurriculars: string;
  demographics: string[];
  admissionTimeline: string;
  constraints: string;
}

const StudentIntake = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);

  const generateMatches = async (formData: QuestionnaireData) => {
    setIsGeneratingMatches(true);
    
    // Define actualMajor at the start so it's available in catch block
    const actualMajor = formData.major === "other" && formData.customMajor 
      ? formData.customMajor 
      : formData.major;
    
    try {
      // Use custom major if "other" is selected
      const actualMajor = formData.major === "other" && formData.customMajor 
        ? formData.customMajor 
        : formData.major;

      const prompt = `Generate personalized university search results for international students based on the questionnaire data provided.

Student Profile: ${JSON.stringify({...formData, actualMajor})}

Return results in structured JSON format that matches this exact schema for rich university cards and PDF export.

Each university result MUST include ALL these fields:
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

Return ONLY valid JSON array of 3-5 universities matching this format:
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

Do NOT return plain text, tables, or markdown. Only return valid JSON following this schema.`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt, context: 'university_matching' }
      });

      if (error) {
        throw error;
      }

      // Parse the JSON response
      let jsonString = data.message || data.response;
      
      // Find JSON array in response
      const arrayStart = jsonString.indexOf('[');
      const arrayEnd = jsonString.lastIndexOf(']') + 1;
      
      if (arrayStart !== -1 && arrayEnd !== -1) {
        jsonString = jsonString.substring(arrayStart, arrayEnd);
      }
      
      const matchesArray = JSON.parse(jsonString);
      
      // Convert to expected format for ResultsDisplay
      const matchData = {
        matches: matchesArray,
        profile_summary: {
          major: actualMajor,
          GPA: formData.gpa,
          budget: formData.budget
        }
      };
      
      // Navigate to results page with match data
      navigate('/results', { 
        state: { 
          matchData: {
            ...matchData,
            actualMajor: actualMajor,
            originalProfile: formData
          }
        } 
      });
      
      toast({
        title: "University Matches Generated! ✨",
        description: `Found ${matchData.matches?.length || 0} personalized matches for ${actualMajor}!`
      });
    } catch (error) {
      console.error('Error generating matches:', error);
      
      toast({
        title: "Generation Failed",
        description: "Unable to generate university matches. Please try again.",
        variant: "destructive"
      });
      
      // Navigate to results with error state
      navigate('/results', { 
        state: { 
          matchData: {
            matches: [],
            profile_summary: {
              major: actualMajor,
              GPA: formData.gpa,
              budget: formData.budget
            },
            hasError: true,
            originalProfile: formData
          }
        } 
      });
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const handleStartQuestionnaire = () => {
    setShowForm(true);
  };

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    generateMatches(data);
  };

  const handleStartNew = () => {
    setShowForm(false);
  };


  // Show questionnaire form if started
  if (showForm) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              U.S. University Questionnaire
            </h2>
            <p className="text-muted-foreground text-lg">
              Help us find your perfect university matches
            </p>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <University className="h-5 w-5" />
                Find Your Perfect Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionnaireForm 
                onSubmit={handleQuestionnaireSubmit}
                isLoading={isGeneratingMatches}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Show homepage with CTA
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Find Your Perfect U.S. University
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Get AI-powered recommendations tailored to your profile, goals, and preferences
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <section id="questionnaire-section">
              <button
                onClick={handleStartQuestionnaire}
                className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg shadow-elegant transition-all duration-300 hover:shadow-glow"
              >
                <Sparkles className="mr-2 h-5 w-5 inline" />
                Start Questionnaire
              </button>
            </section>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-3xl">
              <div className="text-center p-6 bg-card rounded-lg shadow-card">
                <University className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Matching</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered analysis of 10+ factors including academics, finances, and preferences
                </p>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg shadow-card">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Personalized Results</h3>
                <p className="text-sm text-muted-foreground">
                  Custom recommendations with fit scores, scholarships, and next steps
                </p>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg shadow-card">
                <University className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">U.S. Focused</h3>
                <p className="text-sm text-muted-foreground">
                  Specialized in American universities, scholarships, and application processes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Panel Placeholder */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <University className="h-5 w-5" />
              Your University Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <University className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Complete the questionnaire to see your personalized U.S. university matches.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default StudentIntake;
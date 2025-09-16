import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, University } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QuestionnaireForm from "./questionnaire/QuestionnaireForm";
import MatchResults, { MatchData } from "./questionnaire/MatchResults";

interface QuestionnaireData {
  major: string;
  gpa: string;
  satScore: string;
  actScore: string;
  subjectTests: string;
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
  const [showForm, setShowForm] = useState(false);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchData | null>(null);

  const generateMatches = async (formData: QuestionnaireData) => {
    setIsGeneratingMatches(true);
    
    try {
      const prompt = `You are an admissions-match generator. Use ONLY the questionnaire data provided. Consider only U.S. colleges/universities. Do NOT invent facts; if you include time-sensitive items (deadlines, acceptance rates, costs), mark them as "needs_verification": true unless an external enrichment step is performed. Output MUST be valid JSON following the schema exactly.

Here is the student profile (QUESTIONNAIRE_ANSWERS): ${JSON.stringify(formData)}

TASK:
1) Produce up to 10 U.S. university matches ranked by match_score (0-100).
2) For each match provide a fit breakdown (academic, program, financial, location, culture), a 1-2 sentence "why this fits" explanation tied to inputs, and suggested next actions.
3) Produce up to 10 scholarship recommendations (U.S. only) relevant to the profile, with eligibility bullets and estimated award range.
4) Return output as JSON exactly matching the provided schema.

Output only JSON in this exact format:
{
  "generated_at": "ISO_8601_timestamp",
  "profile_summary": {
    "major": "${formData.major}",
    "GPA": "${formData.gpa}",
    "enrollmentType": "${formData.enrollmentType}",
    "budget": "${formData.budget}"
  },
  "matches": [
    {
      "name": "string",
      "city": "string",
      "state": "string",
      "unit_id": "string_or_null",
      "match_score": 0,
      "fit": {
        "academic": 0,
        "program": 0,
        "financial": 0,
        "location": 0,
        "culture": 0
      },
      "why_match": "string (1-2 sentences focused on user inputs)",
      "suggested_next_steps": ["Apply", "Visit", "Contact Admissions", "Request Scholarship Info"],
      "application_deadline": {
        "type": "string e.g., 'Regular' or 'Priority'",
        "date": "YYYY-MM-DD or null",
        "needs_verification": true
      },
      "estimated_net_price": {
        "value": 0,
        "currency": "USD",
        "needs_verification": true
      },
      "scholarship_matches": [
        {
          "name": "string",
          "award_range": "string e.g., '$2k-$20k'",
          "eligibility_summary": "string",
          "deadline": "YYYY-MM-DD or null",
          "needs_verification": true,
          "match_score": 0
        }
      ]
    }
  ],
  "scholarship_recommendations": [
    {
      "name": "string",
      "award_range": "string",
      "eligibility": "string",
      "deadline": "YYYY-MM-DD or null",
      "application_link": "string_or_null",
      "needs_verification": true,
      "match_score": 0
    }
  ],
  "assumptions": ["list any assumptions the system made"],
  "notes": "string - short caution about verifying time-sensitive data"
}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt }
      });

      if (error) {
        throw error;
      }

      // Parse the JSON response
      const jsonStart = data.response.indexOf('{');
      const jsonEnd = data.response.lastIndexOf('}') + 1;
      const jsonString = data.response.substring(jsonStart, jsonEnd);
      
      const matchData: MatchData = JSON.parse(jsonString);
      setMatchResults(matchData);
      
      toast({
        title: "University Matches Generated! ✨",
        description: "Your personalized matches are ready!"
      });
    } catch (error) {
      console.error('Error generating matches:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. There was an issue generating your matches.",
        variant: "destructive"
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
    setMatchResults(null);
  };


  // Show results if available
  if (matchResults) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <MatchResults data={matchResults} onStartNew={handleStartNew} />
        </div>
      </section>
    );
  }

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
            <button
              onClick={handleStartQuestionnaire}
              className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg shadow-elegant transition-all duration-300 hover:shadow-glow"
            >
              <Sparkles className="mr-2 h-5 w-5 inline" />
              Start Questionnaire
            </button>
            
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
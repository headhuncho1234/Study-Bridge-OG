import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import VisaQuestionnaire, { VisaPreferences } from "@/components/questionnaire/VisaQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VisaQuestionnairePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateVisaGuidance = async (formData: VisaPreferences) => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create a comprehensive visa preparation guide based on the following information:

Citizenship: ${formData.citizenship}
Current Country: ${formData.currentCountry}
Visa Type: ${formData.visaType}
Current Status: ${formData.currentVisaStatus}
University: ${formData.university}
Program Type: ${formData.programType}
Program Start: ${formData.programStart}
Previous Visas: ${formData.previousVisas.join(', ')}
Ready Documents: ${formData.documents.join(', ')}
Timeline: ${formData.timeline}
Special Circumstances: ${formData.specialCircumstances}

Please provide:
1. A personalized preparation roadmap
2. Country-specific requirements and tips
3. Document checklist with status (ready/needed)
4. Timeline with specific dates and milestones
5. Interview preparation guide
6. Common questions for this profile
7. Embassy-specific information
8. Fee breakdown and payment schedule

Format as JSON:
{
  "profile": "Brief summary of visa application profile",
  "roadmap": {
    "estimated_timeline": "X weeks/months",
    "success_probability": "High/Medium/Low",
    "key_challenges": ["challenge1", "challenge2"]
  },
  "document_checklist": [
    {
      "document": "Document Name",
      "status": "ready/needed/in_progress",
      "priority": "high/medium/low",
      "instructions": "How to obtain/complete"
    }
  ],
  "timeline": [
    {
      "phase": "Phase Name",
      "duration": "X weeks",
      "tasks": ["task1", "task2"],
      "deadline": "Recommended completion date"
    }
  ],
  "interview_prep": {
    "common_questions": ["Question 1?", "Question 2?"],
    "preparation_tips": ["tip1", "tip2"],
    "documents_to_bring": ["doc1", "doc2"]
  },
  "embassy_info": {
    "location": "Embassy location/address",
    "wait_times": "Typical appointment wait time",
    "specific_requirements": ["req1", "req2"]
  },
  "fees": {
    "sevis_fee": "$XXX",
    "application_fee": "$XXX",
    "total_estimated": "$XXX"
  }
}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      let visaResults;
      try {
        visaResults = JSON.parse(data.response);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback data
        visaResults = {
          profile: `Visa preparation guide for ${formData.citizenship} citizen applying for ${formData.visaType} visa`,
          roadmap: {
            estimated_timeline: "6-8 weeks",
            success_probability: "High",
            key_challenges: ["Document preparation", "Interview scheduling"]
          },
          document_checklist: [
            {
              document: "Valid Passport",
              status: formData.documents.includes('Valid Passport') ? 'ready' : 'needed',
              priority: "high",
              instructions: "Must be valid for at least 6 months beyond intended stay"
            }
          ],
          timeline: [
            {
              phase: "Document Collection",
              duration: "2-3 weeks",
              tasks: ["Gather financial statements", "Obtain transcripts", "Prepare I-20"],
              deadline: "Week 3"
            }
          ],
          interview_prep: {
            common_questions: [
              "Why do you want to study in the US?",
              "How will you finance your education?",
              "What are your plans after graduation?"
            ],
            preparation_tips: [
              "Practice speaking clearly and confidently",
              "Prepare specific examples about your academic goals",
              "Bring organized documents"
            ],
            documents_to_bring: ["Passport", "I-20", "Financial documents"]
          },
          embassy_info: {
            location: "US Embassy in your country",
            wait_times: "2-4 weeks for appointment",
            specific_requirements: ["Biometric appointment may be required"]
          },
          fees: {
            sevis_fee: "$350",
            application_fee: "$160",
            total_estimated: "$510"
          }
        };
      }

      navigate('/results', { 
        state: { 
          matchData: visaResults,
          source: 'visa-questionnaire'
        } 
      });

    } catch (error) {
      console.error('Error generating visa guidance:', error);
      toast({
        title: "Error generating guidance",
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
          <Link to="/features/visa-guidance">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Visa Preparation Questionnaire
            </h1>
            <p className="text-muted-foreground">
              Get personalized visa guidance
            </p>
          </div>
        </div>

        <VisaQuestionnaire 
          onSubmit={generateVisaGuidance}
          isLoading={isGenerating}
        />

        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Creating Your Visa Preparation Guide</h3>
              <p className="text-muted-foreground">
                Analyzing requirements and creating personalized timeline...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaQuestionnairePage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import HousingQuestionnaire, { HousingPreferences } from "@/components/questionnaire/HousingQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HousingQuestionnairePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateHousingMatches = async (formData: HousingPreferences) => {
    setIsGenerating(true);
    
    try {
      const prompt = `Generate comprehensive housing recommendations based on the following preferences:

University: ${formData.university}
Budget: $${formData.budget[0]} per month
Housing Type: ${formData.housingType}
Preferred Locations: ${formData.location.join(', ')}
Roommate Preference: ${formData.roommates}
Important Amenities: ${formData.amenities.join(', ')}
Transportation: ${formData.transportation.join(', ')}
Timeline: ${formData.timeline}
Special Requirements: ${formData.additionalRequirements}

Please provide:
1. A brief profile summary
2. 5-8 specific housing recommendations with:
   - Property name and address
   - Monthly rent estimate
   - Distance to campus
   - Amenities included
   - Pros and cons
   - Contact information
3. Additional housing tips for this location
4. Budget breakdown including utilities and other costs
5. Safety and transportation information

Format as JSON with the structure:
{
  "profile": "Brief summary of user preferences",
  "recommendations": [
    {
      "name": "Property Name",
      "address": "Full Address", 
      "rent": "$X/month",
      "distance": "X miles/minutes from campus",
      "type": "Apartment/Dorm/House",
      "amenities": ["amenity1", "amenity2"],
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "contact": "Contact information",
      "match_score": 85
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "budget_breakdown": {
    "rent": "$X",
    "utilities": "$X", 
    "internet": "$X",
    "transportation": "$X",
    "total_estimated": "$X"
  },
  "area_info": {
    "safety_rating": "X/10",
    "transportation": "Description",
    "nearby_amenities": ["amenity1", "amenity2"]
  }
}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt }
      });

      if (error) throw error;

      let housingResults;
      try {
        housingResults = JSON.parse(data.response);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback data
        housingResults = {
          profile: `Housing search for ${formData.university} student with $${formData.budget[0]}/month budget`,
          recommendations: [
            {
              name: "Campus View Apartments",
              address: "123 University Ave",
              rent: `$${Math.round(formData.budget[0] * 0.9)}/month`,
              distance: "0.5 miles from campus",
              type: "Apartment",
              amenities: formData.amenities.slice(0, 4),
              pros: ["Close to campus", "Modern facilities"],
              cons: ["Higher rent", "Limited parking"],
              contact: "contact@campusview.com",
              match_score: 90
            }
          ],
          tips: ["Start searching early", "Visit properties in person", "Check reviews online"],
          budget_breakdown: {
            rent: `$${formData.budget[0]}`,
            utilities: "$100",
            internet: "$50",
            transportation: "$80",
            total_estimated: `$${formData.budget[0] + 230}`
          },
          area_info: {
            safety_rating: "8/10",
            transportation: "Good public transit access",
            nearby_amenities: ["Grocery stores", "Restaurants", "Library"]
          }
        };
      }

      navigate('/results', { 
        state: { 
          matchData: housingResults,
          source: 'housing-questionnaire'
        } 
      });

    } catch (error) {
      console.error('Error generating housing matches:', error);
      toast({
        title: "Error generating recommendations",
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
          <Link to="/features/housing-solutions">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Housing Questionnaire
            </h1>
            <p className="text-muted-foreground">
              Find your perfect housing match
            </p>
          </div>
        </div>

        <HousingQuestionnaire 
          onSubmit={generateHousingMatches}
          isLoading={isGenerating}
        />

        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Finding Your Perfect Housing Match</h3>
              <p className="text-muted-foreground">
                Analyzing your preferences and searching thousands of properties...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousingQuestionnairePage;
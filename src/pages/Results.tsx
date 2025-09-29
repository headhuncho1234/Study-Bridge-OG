import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Home, Download } from "lucide-react";
import ResultsDisplay from "@/components/questionnaire/ResultsDisplay";
import HousingFilters from "@/components/housing/HousingFilters";
import { saveResult } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<any | null>(null);
  const [filteredResults, setFilteredResults] = useState<any | null>(null);
  const [user, setUser] = useState(null);

  const source = location.state?.source;
  const isHousingResults = source?.includes('housing');

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Get match data from navigation state or URL params
    if (location.state?.matchData) {
      setMatchData(location.state.matchData);
      setFilteredResults(location.state.matchData);
    } else {
      // Check for data in URL params (from saved results)
      const urlParams = new URLSearchParams(location.search);
      const dataParam = urlParams.get('data');
      if (dataParam) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(dataParam));
          setMatchData(parsedData);
          setFilteredResults(parsedData);
        } catch (error) {
          console.error('Error parsing URL data:', error);
          navigate('/');
        }
      } else {
        // Redirect to home if no data
        navigate('/');
      }
    }
  }, [location.state, location.search, navigate]);

  const handleFiltersChange = (filters: any) => {
    if (!isHousingResults || !matchData?.recommendations) {
      return;
    }

    let filtered = [...matchData.recommendations];

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter((housing: any) => {
        const rent = parseInt(housing.rent.replace(/[^\d]/g, ''));
        return rent >= filters.priceRange[0] && rent <= filters.priceRange[1];
      });
    }

    // Filter by housing types
    if (filters.housingTypes?.length > 0) {
      filtered = filtered.filter((housing: any) => 
        filters.housingTypes.some((type: string) => 
          housing.type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filter by amenities
    if (filters.amenities?.length > 0) {
      filtered = filtered.filter((housing: any) => 
        filters.amenities.some((amenity: string) => 
          housing.amenities.some((a: string) => 
            a.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Filter by guarantor status (for international students)
    if (filters.guarantorStatus && filters.guarantorStatus !== 'all') {
      filtered = filtered.filter((housing: any) => {
        switch (filters.guarantorStatus) {
          case 'no-guarantor':
            return housing.type === 'Dormitory' || housing.type === 'On-Campus';
          case 'guarantor-services':
            return housing.type === 'Homestay' || housing.type === 'Student Apartment';
          case 'traditional':
            return housing.type === 'Apartment' || housing.type === 'Shared House';
          default:
            return true;
        }
      });
    }

    // Filter by distance
    if (filters.distance && filters.distance !== 'all') {
      filtered = filtered.filter((housing: any) => {
        const distance = housing.distance.toLowerCase();
        switch (filters.distance) {
          case 'walking':
            return distance.includes('0.') || distance.includes('on campus');
          case 'short-commute':
            return distance.includes('1.') || distance.includes('2.');
          case 'moderate-commute':
            return distance.includes('3.') || distance.includes('4.') || distance.includes('5.');
          case 'long-commute':
            return true; // All options for long commute
          default:
            return true;
        }
      });
    }

    setFilteredResults({
      ...matchData,
      recommendations: filtered
    });
  };

  // Auto-save results for authenticated users with new match data
  useEffect(() => {
    const autoSaveResults = async () => {
      if (user && matchData && location.state?.matchData) {
        // Only auto-save if this is fresh data from questionnaire (not loaded from saved results)
        const source = location.state?.source || 'questionnaire';
        const title = source === 'scholarship-questionnaire' 
          ? `Scholarship Matches - ${new Date().toLocaleDateString()}`
          : source === 'housing-questionnaire' 
          ? `Housing Matches - ${new Date().toLocaleDateString()}`
          : source === 'visa-questionnaire'
          ? `Visa Guidance - ${new Date().toLocaleDateString()}`
          : `University Matches - ${new Date().toLocaleDateString()}`;
        
        try {
          // Save to saved_results table
          const { error: savedResultsError } = await supabase
            .from('saved_results')
            .insert({
              user_id: user.id,
              title,
              data: JSON.parse(JSON.stringify(matchData))
            });

          if (savedResultsError) throw savedResultsError;

          // Also save to profile.questionnaire_results for historical tracking
          const { data: profile } = await supabase
            .from('profiles')
            .select('questionnaire_results')
            .eq('user_id', user.id)
            .single();

           // Ensure currentResults is always an array
           let currentResults = [];
           if (profile?.questionnaire_results) {
             if (Array.isArray(profile.questionnaire_results)) {
               currentResults = profile.questionnaire_results;
             } else {
               // If it's not an array, wrap it in an array or start fresh
               currentResults = [];
             }
           }
           
           const newResult = {
             timestamp: new Date().toISOString(),
             source: source,
             title: title,
             data: matchData
           };

           const updatedResults = [...currentResults, newResult];

          const { error: profileError } = await supabase
            .from('profiles')
            .update({ questionnaire_results: updatedResults })
            .eq('user_id', user.id);

          if (profileError) throw profileError;

          toast({
            title: "Results Automatically Saved! ✨",
            description: "Your matches have been saved to your profile.",
          });
        } catch (error) {
          console.error('Error auto-saving results:', error);
        }
      }
    };

    autoSaveResults();
  }, [user, matchData, location.state, toast]);

  const handleSaveResults = async () => {
    if (!matchData) return;

    const source = location.state?.source || 'questionnaire';
    const title = source === 'scholarship-questionnaire' 
      ? `Scholarship Matches - ${new Date().toLocaleDateString()}`
      : source === 'housing-questionnaire' 
      ? `Housing Matches - ${new Date().toLocaleDateString()}`
      : source === 'visa-questionnaire'
      ? `Visa Guidance - ${new Date().toLocaleDateString()}`
      : `University Matches - ${new Date().toLocaleDateString()}`;
    
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_results')
          .insert({
            user_id: user.id,
            title,
            data: JSON.parse(JSON.stringify(matchData))
          });

        if (error) throw error;

        toast({
          title: "Saved to Profile",
          description: "Your results have been saved to your profile.",
        });
      } catch (error) {
        console.error('Error saving results:', error);
        toast({
          title: "Error saving results",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } else {
      // Save to localStorage for guests
      saveResult(title, matchData);
      toast({
        title: "Saved Locally",
        description: "Your results have been saved locally. Sign in to save permanently.",
      });
    }
  };

  const handleStartNew = () => {
    navigate('/');
  };

  const handleExportPDF = async () => {
    if (!matchData) return;
    
    try {
      const { generateDynamicPDF } = await import('@/utils/pdfGenerator');
      
      // Determine result type based on source or data structure
      let resultType: 'university' | 'scholarship' | 'housing' | 'wellness' | 'visa' = 'university';
      
      if (source?.includes('scholarship')) {
        resultType = 'scholarship';
      } else if (source?.includes('housing')) {
        resultType = 'housing';
      } else if (source?.includes('visa')) {
        resultType = 'visa';
      } else if (source?.includes('wellness')) {
        resultType = 'wellness';
      } else if ('matches' in matchData) {
        resultType = 'university';
      } else if ('scholarships' in matchData) {
        resultType = 'scholarship';
      } else if ('recommendations' in matchData) {
        resultType = 'housing';
      } else if ('roadmap' in matchData || 'document_checklist' in matchData) {
        resultType = 'visa';
      }
      
      // Extract user answers from profile data if available
      const userAnswers = matchData.profile || {};
      
      const title = source === 'scholarship-questionnaire' 
        ? `Scholarship_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}`
        : source === 'housing-questionnaire' 
        ? `Housing_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}`
        : source === 'visa-questionnaire'
        ? `Visa_Guide_${new Date().toLocaleDateString().replace(/\//g, '-')}`
        : source === 'wellness'
        ? `Wellness_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}`
        : `University_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      
      await generateDynamicPDF(matchData, resultType, userAnswers, title);
      
      toast({
        title: "PDF Generated! 📄",
        description: "Your personalized report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results to display</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <Link to="/">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Questionnaire
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            
            <Button
              onClick={handleSaveResults}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Results
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Filters for Housing Results */}
          {isHousingResults && (
            <HousingFilters 
              onFiltersChange={handleFiltersChange}
              isInternationalStudent={source?.includes('international')}
            />
          )}

          {/* Results Display */}
          <ResultsDisplay data={filteredResults || matchData} source={source} />
        </div>
      </div>
    </div>
  );
};

export default Results;
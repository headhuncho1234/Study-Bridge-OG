import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Home } from "lucide-react";
import ResultsDisplay from "@/components/questionnaire/ResultsDisplay";
import { saveResult } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<any | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Get match data from navigation state or URL params
    if (location.state?.matchData) {
      setMatchData(location.state.matchData);
    } else {
      // Check for data in URL params (from saved results)
      const urlParams = new URLSearchParams(location.search);
      const dataParam = urlParams.get('data');
      if (dataParam) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(dataParam));
          setMatchData(parsedData);
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
          const { error } = await supabase
            .from('saved_results')
            .insert({
              user_id: user.id,
              title,
              data: JSON.parse(JSON.stringify(matchData))
            });

          if (error) throw error;

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
          
          <Button
            onClick={handleSaveResults}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Results
          </Button>
        </div>

        {/* Results */}
        <ResultsDisplay data={matchData} source={location.state?.source} />
      </div>
    </div>
  );
};

export default Results;
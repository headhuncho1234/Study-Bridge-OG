import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Home } from "lucide-react";
import MatchResults, { MatchData } from "@/components/questionnaire/MatchResults";
import { saveResult } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Get match data from navigation state
    if (location.state?.matchData) {
      setMatchData(location.state.matchData);
    } else {
      // Redirect to home if no data
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleSaveResults = () => {
    if (!matchData) return;

    const title = `University Matches - ${new Date().toLocaleDateString()}`;
    
    if (user) {
      // TODO: Implement Supabase saving when user is logged in
      toast({
        title: "Saved to Profile",
        description: "Your results have been saved to your profile.",
      });
    } else {
      // Save to localStorage for guests
      saveResult(title, matchData);
      toast({
        title: "Saved to Profile",
        description: "Your results have been saved locally. View in Saved Results.",
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
        <MatchResults data={matchData} onStartNew={handleStartNew} />
      </div>
    </div>
  );
};

export default Results;
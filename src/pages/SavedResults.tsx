import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2, BookOpen, DollarSign, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface SavedResult {
  id: string;
  title: string;
  date: string;
  data: any;
}

const SavedResults = () => {
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedResults();
    } else {
      setIsAuthModalOpen(true);
    }
  }, [user]);

  const loadSavedResults = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedResults = data?.map(result => ({
        id: result.id,
        title: result.title,
        date: new Date(result.created_at).toLocaleDateString(),
        data: result.data
      })) || [];

      setSavedResults(formattedResults);
    } catch (error) {
      console.error('Error loading saved results:', error);
      toast({
        title: "Error loading results",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_results')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedResults(prev => prev.filter(result => result.id !== id));
      
      toast({
        title: "Result deleted",
        description: "The saved result has been removed.",
      });
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error deleting result",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleView = (result: SavedResult) => {
    // Navigate to results page with the saved data
    window.location.href = `/results?data=${encodeURIComponent(JSON.stringify(result.data))}`;
  };

  const handleExport = async (result: SavedResult) => {
    try {
      const { generateDynamicPDF } = await import('@/utils/pdfGenerator');
      
      // Determine result type based on data structure
      let resultType: 'university' | 'scholarship' | 'housing' | 'wellness' | 'visa' = 'university';
      
      if ('matches' in result.data) {
        resultType = 'university';
      } else if ('scholarships' in result.data) {
        resultType = 'scholarship';
      } else if ('recommendations' in result.data) {
        resultType = 'housing';
      } else if ('roadmap' in result.data || 'document_checklist' in result.data) {
        resultType = 'visa';
      } else if (result.title.toLowerCase().includes('wellness')) {
        resultType = 'wellness';
      }
      
      // Extract user answers from profile data if available
      const userAnswers = result.data.profile || {};
      
      await generateDynamicPDF(result.data, resultType, userAnswers, result.title);
      
      toast({
        title: "PDF Generated! 📄",
        description: "Your personalized report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Fallback to JSON export
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.title.replace(/\s+/g, '_')}_results.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Results exported as JSON",
        description: "PDF generation failed, exported as JSON instead.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Saved Results
            </h1>
            <p className="text-muted-foreground">
              Your personalized university recommendations and matches
            </p>
          </div>
        </div>

        {/* Results Grid */}
        {savedResults.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">Saved on {result.date}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {result.data?.universities && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {result.data.universities.length} Universities
                        </span>
                      </div>
                    )}
                    
                    {result.data?.scholarships && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-secondary" />
                        <span className="text-sm">
                          {result.data.scholarships.length} Scholarships
                        </span>
                      </div>
                    )}
                    
                    {result.data?.preferences?.budget && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <Badge variant="outline" className="text-xs">
                          {result.data.preferences.budget}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleView(result)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExport(result)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(result.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No saved results yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete the questionnaire to get personalized university recommendations that you can save.
              </p>
              <Link to="/#intake">
                <Button>
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SavedResults;
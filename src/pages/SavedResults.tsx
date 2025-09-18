import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Trash2, 
  Share, 
  ArrowLeft,
  Calendar,
  GraduationCap
} from "lucide-react";
import { getSavedResults, deleteResult, SavedResult } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import CreatePostModal from "@/components/community/CreatePostModal";

const SavedResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedResults, setSavedResults] = useState<SavedResult[]>(getSavedResults());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SavedResult | null>(null);

  const handleViewResult = (result: SavedResult) => {
    navigate('/results', { state: { matchData: result.data } });
  };

  const handleDeleteResult = (id: string) => {
    deleteResult(id);
    setSavedResults(getSavedResults());
    toast({
      title: "Result Deleted",
      description: "Your saved result has been removed.",
    });
  };

  const handleShareToCommunity = (result: SavedResult) => {
    setSelectedResult(result);
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = (postData: { title: string; content: string }) => {
    // This would normally save to community posts
    // For now, just show success toast
    toast({
      title: "Shared to Community",
      description: "Your results have been shared with the community!",
    });
    setIsShareModalOpen(false);
    setSelectedResult(null);
  };

  const formatShareContent = (result: SavedResult) => {
    if (!result.data.matches) return '';
    
    const topMatches = result.data.matches.slice(0, 3);
    let content = `<h3>My University Match Results</h3>`;
    content += `<p>Just got my personalized university recommendations! Here are my top matches:</p>`;
    content += `<ol>`;
    
    topMatches.forEach((match: any) => {
      content += `<li><strong>${match.name}</strong> (${match.city}, ${match.state}) - ${match.match_score}% match</li>`;
    });
    
    content += `</ol>`;
    content += `<p>The AI analysis considered my academic background, preferences, and financial situation. Pretty impressed with these recommendations!</p>`;
    content += `<p>Has anyone else used this tool? Would love to hear about your experiences!</p>`;
    
    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Saved Results
            </h1>
            <p className="text-muted-foreground">
              Your previously saved university match results
            </p>
          </div>
          
          <div></div> {/* Spacer for flexbox */}
        </div>

        {/* Results Grid */}
        {savedResults.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Saved Results</h3>
              <p className="text-muted-foreground mb-4">
                Complete a questionnaire to get personalized university matches
              </p>
              <Button onClick={() => navigate('/')}>
                Start Questionnaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResults.map((result) => (
              <Card key={result.id} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {result.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Result Summary */}
                    {result.data.matches && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.data.matches.length} university matches found
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.data.matches.slice(0, 2).map((match: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {match.name}
                            </Badge>
                          ))}
                          {result.data.matches.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.data.matches.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Profile Summary */}
                    {result.data.profile_summary && (
                      <div className="text-xs text-muted-foreground">
                        <p>Major: {result.data.profile_summary.major}</p>
                        <p>GPA: {result.data.profile_summary.GPA}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        size="sm"
                        onClick={() => handleViewResult(result)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareToCommunity(result)}
                      >
                        <Share className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteResult(result.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <CreatePostModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedResult(null);
        }}
        onSubmit={handleShareSubmit}
        prefillData={selectedResult ? {
          title: `My University Match Results - ${new Date().toLocaleDateString()}`,
          content: formatShareContent(selectedResult)
        } : undefined}
      />
    </div>
  );
};

export default SavedResults;
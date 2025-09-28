import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Clock, Users, ExternalLink, Home, Award, FileText, Info, Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface School {
  id: string;
  name: string;
  website: string | null;
  tuition: number;
  acceptance_rate: string;
  difficulty: string;
  location: string;
  ranking: string;
  programs: string[];
  scholarships: any;
  details: any;
}

interface EnhancedResultsDisplayProps {
  userPreferences?: {
    field_of_study?: string;
    budget_max?: number;
    preferred_location?: string;
  };
}

const EnhancedResultsDisplay = ({ userPreferences }: EnhancedResultsDisplayProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [savedSchools, setSavedSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
    if (user) {
      loadSavedSchools();
    }
  }, [user, userPreferences]);

  const loadSchools = async () => {
    try {
      let query = supabase.from('schools').select('*');

      // Filter by user preferences if available
      if (userPreferences?.budget_max) {
        query = query.lte('tuition', userPreferences.budget_max);
      }

      if (userPreferences?.preferred_location) {
        query = query.ilike('location', `%${userPreferences.preferred_location}%`);
      }

      const { data, error } = await query.order('tuition', { ascending: true }).limit(10);

      if (error) throw error;

      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast({
        title: "Error loading recommendations",
        description: "Could not load school recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSchools = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('questionnaire_results')
        .eq('user_id', user.id)
        .single();

      if (profile?.questionnaire_results) {
        const results = profile.questionnaire_results as any;
        setSavedSchools(results.saved_schools || []);
      }
    } catch (error) {
      console.error('Error loading saved schools:', error);
    }
  };

  const toggleSaveSchool = async (schoolId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save schools to your profile.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('questionnaire_results')
        .eq('user_id', user.id)
        .single();

      const currentResults = (profile?.questionnaire_results as any) || {};
      const currentSaved = currentResults.saved_schools || [];
      
      let newSaved;
      if (currentSaved.includes(schoolId)) {
        newSaved = currentSaved.filter((id: string) => id !== schoolId);
      } else {
        newSaved = [...currentSaved, schoolId];
      }

      const updatedResults = {
        ...currentResults,
        saved_schools: newSaved
      };

      const { error } = await supabase
        .from('profiles')
        .update({ questionnaire_results: updatedResults })
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSchools(newSaved);
      
      toast({
        title: currentSaved.includes(schoolId) ? "School removed" : "School saved",
        description: currentSaved.includes(schoolId) 
          ? "School removed from your saved list" 
          : "School saved to your profile"
      });

    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "Error",
        description: "Could not save school. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSchoolClick = (school: School) => {
    const url = school.website || `https://www.google.com/search?q=${encodeURIComponent(school.name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatTuition = (tuition: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(tuition);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'very hard':
        return 'border-red-500 text-red-600';
      case 'hard':
        return 'border-orange-500 text-orange-600';
      case 'moderate':
        return 'border-yellow-500 text-yellow-600';
      default:
        return 'border-green-500 text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Loading Your Personalized Recommendations...</h2>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Your Personalized School Recommendations
        </h2>
        <p className="text-muted-foreground">
          Based on your preferences, here are schools that match your criteria
        </p>
      </div>

      <div className="grid gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-card transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-primary hover:underline cursor-pointer">
                    <button 
                      onClick={() => handleSchoolClick(school)}
                      className="text-left hover:underline"
                    >
                      {school.name}
                    </button>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{school.location}</span>
                  </div>
                  {school.ranking && (
                    <div className="text-sm font-medium text-accent mt-1">
                      {school.ranking}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveSchool(school.id)}
                    className="h-8 w-8 p-0"
                  >
                    {savedSchools.includes(school.id) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-muted-foreground">Tuition</div>
                    <div className="font-bold text-green-600">
                      {formatTuition(school.tuition)}/year
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-muted-foreground">Acceptance Rate</div>
                    <div className="font-medium">{school.acceptance_rate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-muted-foreground">Difficulty</div>
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(school.difficulty)}
                    >
                      {school.difficulty}
                    </Badge>
                  </div>
                </div>
                {school.details.student_body && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-muted-foreground">Students</div>
                      <div className="font-medium">
                        {school.details.student_body.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {school.details.description && (
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  {school.details.description}
                </p>
              )}
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Available Programs:</div>
                <div className="flex flex-wrap gap-1">
                  {school.programs.slice(0, 4).map((program, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                  {school.programs.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{school.programs.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {school.scholarships && Array.isArray(school.scholarships) && school.scholarships.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Available Scholarships:
                  </div>
                  {school.scholarships.slice(0, 2).map((scholarship: any, idx: number) => (
                    <div key={idx} className="text-xs text-green-700 dark:text-green-300">
                      • {scholarship.name}: {scholarship.amount} ({scholarship.eligibility})
                    </div>
                  ))}
                  {school.scholarships.length > 2 && (
                    <div className="text-xs text-green-600 mt-1">
                      +{school.scholarships.length - 2} more scholarships available
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSchoolClick(school)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Official Website
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleSaveSchool(school.id)}
                  className="px-4"
                >
                  {savedSchools.includes(school.id) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schools.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground">
              Try adjusting your preferences or budget to see more schools.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedResultsDisplay;
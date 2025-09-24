import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, GraduationCap, Home, DollarSign, FileText, Calendar, TrendingUp, Coins, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { useWellnessData } from "@/hooks/useWellnessData";

interface DashboardData {
  savedResults: any[];
  applicationDeadlines: any[];
  recommendedActions: any[];
  progressStats: {
    universitiesApplied: number;
    scholarshipsApplied: number;
    documentsCompleted: number;
    overallProgress: number;
  };
}

const Dashboard = () => {
  const { wellnessData } = useWellnessData();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    savedResults: [],
    applicationDeadlines: [],
    recommendedActions: [],
    progressStats: {
      universitiesApplied: 0,
      scholarshipsApplied: 0,
      documentsCompleted: 0,
      overallProgress: 0
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setIsAuthModalOpen(true);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load saved results
      const { data: savedResults, error } = await supabase
        .from('saved_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const mockData: DashboardData = {
        savedResults: savedResults || [],
        applicationDeadlines: [
          { university: "Stanford University", deadline: "2024-12-15", type: "Application" },
          { university: "MIT", deadline: "2024-01-01", type: "Application" },
          { scholarship: "Merit Scholarship", deadline: "2024-02-15", type: "Scholarship" }
        ],
        recommendedActions: [
          { action: "Complete housing questionnaire", priority: "high" },
          { action: "Schedule visa interview", priority: "medium" },
          { action: "Submit transcript requests", priority: "low" }
        ],
        progressStats: {
          universitiesApplied: Math.min(savedResults?.length || 0, 5),
          scholarshipsApplied: 2,
          documentsCompleted: 6,
          overallProgress: 65
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Your Dashboard</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to view your personalized student dashboard with saved results, 
                application progress, and recommendations.
              </p>
              <Button onClick={() => setIsAuthModalOpen(true)} className="w-full">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </>
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
              My Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your progress and manage your applications
            </p>
          </div>
        </div>

        {/* Wellness Stats */}
        {(wellnessData.coins > 0 || wellnessData.streak > 0 || wellnessData.badges.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Wellness Progress</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="text-xl font-bold">{wellnessData.coins}</p>
                      <p className="text-sm text-muted-foreground">Wellness Coins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-xl font-bold">{wellnessData.streak}</p>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="text-purple-500 bg-purple-100 dark:bg-purple-900">
                      {wellnessData.badges.length} Badges
                    </Badge>
                    <div className="flex gap-1">
                      {wellnessData.badges.slice(0, 3).map((badge, idx) => (
                        <span key={idx} className="text-lg">
                          {badge === 'zen-warrior' ? '⚔️' : badge === 'mind-master' ? '🧠' : '👑'}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{dashboardData.progressStats.universitiesApplied}</p>
                  <p className="text-sm text-muted-foreground">Universities Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{dashboardData.progressStats.scholarshipsApplied}</p>
                  <p className="text-sm text-muted-foreground">Scholarships Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{dashboardData.progressStats.documentsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Documents Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{dashboardData.progressStats.overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{dashboardData.progressStats.overallProgress}%</span>
                </div>
                <Progress value={dashboardData.progressStats.overallProgress} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Recent Saved Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.savedResults.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.savedResults.map((result, index) => (
                    <div key={result.id || index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Saved</Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/profile/saved">
                    <Button variant="outline" className="w-full mt-4">
                      View All Results
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No saved results yet</p>
                  <Link to="/#intake">
                    <Button>Take Questionnaire</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.applicationDeadlines.map((deadline, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {deadline.university || deadline.scholarship}
                        </h4>
                        <p className="text-sm text-muted-foreground">{deadline.type}</p>
                      </div>
                      <Badge variant={
                        new Date(deadline.deadline) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                          ? "destructive" 
                          : "secondary"
                      }>
                        {deadline.deadline}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <Link to="/questionnaires/housing">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Home className="h-6 w-6 mb-2" />
                  Housing Search
                </Button>
              </Link>
              <Link to="/questionnaires/visa">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Visa Prep
                </Button>
              </Link>
              <Link to="/questionnaires/scholarships">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Find Scholarships
                </Button>
              </Link>
              <Link to="/community">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <GraduationCap className="h-6 w-6 mb-2" />
                  Community
                </Button>
              </Link>
              <Link to="/features/wellness-support">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Trophy className="h-6 w-6 mb-2" />
                  Wellness
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
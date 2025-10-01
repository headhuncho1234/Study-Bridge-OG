import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Target, Brain, CheckCircle } from "lucide-react";

const SmartMatching = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
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
              Smart School Matching
            </h1>
            <p className="text-muted-foreground">
              AI-powered university recommendations tailored to your goals
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-primary text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <GraduationCap className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Find Your Perfect University Match</h2>
                <p className="text-white/90">
                  Our AI analyzes your preferences, budget, and academic goals to recommend universities 
                  that align with your unique profile and career aspirations.
                </p>
              </div>
            </div>
            
            <Link to="/#intake">
              <Button 
                variant="secondary" 
                size="lg" 
                className="mt-4"
              >
                Start Your Matching Journey
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How Smart Matching Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>1. Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We analyze your academic background, interests, budget constraints, 
                  and location preferences to build a comprehensive profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-secondary mb-2" />
                <CardTitle>2. AI Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our advanced AI algorithms match your profile against thousands of 
                  U.S. universities and programs to find the best fits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-accent mb-2" />
                <CardTitle>3. Personalized Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive ranked university recommendations with detailed explanations, 
                  scholarship opportunities, and next steps for applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What Makes Our Matching Special</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Academic fit (40% of match score)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Program strength & availability (25%)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Financial fit & scholarships (15%)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Location & campus setting (10%)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Cultural & extracurricular fit (10%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalized Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Budget-friendly options prioritized
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Scholarship opportunities highlighted
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Application deadlines tracked
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Next steps provided for each match
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Results saved to your profile
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">Ready to Find Your Perfect Match?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of students who have found their ideal universities through our AI-powered matching system.
            </p>
            <Link to="/#intake">
              <Button 
                size="lg" 
                className="mr-4"
              >
                Start Questionnaire
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg">
                See Success Stories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartMatching;
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, CheckCircle, Clock, Users } from "lucide-react";
import { useVisaTracker } from "@/hooks/useVisaTracker";
import Navbar from "@/components/Navbar";

const VisaGuidance = () => {
  const { visaTasks, updateTaskCompletion, getTaskProgress, getOverallProgress } = useVisaTracker();

  const interviewTips = [
    "Be honest and confident in your responses",
    "Clearly explain your study plans and career goals",
    "Show strong ties to your home country",
    "Demonstrate sufficient financial resources",
    "Prepare for questions about your chosen university",
    "Practice speaking clearly and concisely"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
              Visa Guidance
            </h1>
            <p className="text-muted-foreground">
              Step-by-step support for your U.S. student visa application
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-accent to-accent/80 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <FileText className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Navigate Your Visa Journey with Confidence</h2>
                <p className="text-white/90">
                  Our comprehensive visa guidance system provides step-by-step support, document checklists, 
                  interview preparation, and personalized tips based on your country and situation.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{getOverallProgress()}%</div>
                <div className="text-sm text-white/80">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-white/80">Countries Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-white/80">AI Support</div>
              </div>
            </div>
            
            <Link to="/questionnaires/visa">
              <Button variant="secondary" size="lg" className="mt-4">
                Start Visa Preparation
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Visa Process Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Visa Journey in 4 Steps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {visaTasks.map((task, index) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      <div className="flex items-center gap-1">
                        <div className="text-primary font-bold">{getTaskProgress(task.id)}%</div>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Checkbox 
                          checked={task.completed[idx]}
                          onCheckedChange={(checked) => updateTaskCompletion(task.id, idx, !!checked)}
                        />
                        <span className={`text-sm ${task.completed[idx] ? 'line-through text-muted-foreground' : ''}`}>
                          {item}
                        </span>
                        {task.completed[idx] && (
                          <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interview Preparation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Interview Preparation & Success Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  AI Interview Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Practice with our AI-powered interview simulator that adapts to your profile and provides 
                  personalized feedback on your responses.
                </p>
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Realistic interview scenarios
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Instant feedback and suggestions
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Country-specific guidance
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Common questions database
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewTips.map((tip, index) => (
                    <p key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-secondary mt-1 flex-shrink-0" />
                      {tip}
                    </p>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Download Full Interview Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Tracker */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-center">Smart Document Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Personalized Checklist</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a customized document checklist based on your country and visa type
                  </p>
                </div>
                <div>
                  <Clock className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Deadline Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Never miss important deadlines with automated reminders and alerts
                  </p>
                </div>
                <div>
                  <CheckCircle className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress and see exactly what steps remain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-accent/10 to-primary/10">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">Ready to Start Your Visa Application?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of students who have successfully obtained their U.S. student visa 
              with our comprehensive guidance system.
            </p>
            <Link to="/questionnaires/visa">
              <Button size="lg" className="mr-4">
                Start Visa Preparation
              </Button>
            </Link>
            <Link to="/community?channel=visa">
              <Button variant="outline" size="lg">
                Read Success Stories
              </Button>
            </Link>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default VisaGuidance;
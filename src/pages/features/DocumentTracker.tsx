import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search, CheckCircle, Clock, AlertTriangle, FileText, Calendar } from "lucide-react";

const DocumentTracker = () => {
  const documentCategories = [
    {
      category: "Visa Documents",
      total: 8,
      completed: 6,
      progress: 75,
      color: "text-blue-600",
      documents: [
        { name: "Passport", status: "completed", dueDate: "N/A" },
        { name: "I-20 Form", status: "completed", dueDate: "N/A" },
        { name: "DS-160 Application", status: "completed", dueDate: "N/A" },
        { name: "SEVIS Fee Receipt", status: "completed", dueDate: "N/A" },
        { name: "Financial Statements", status: "completed", dueDate: "N/A" },
        { name: "Visa Interview Appointment", status: "completed", dueDate: "N/A" },
        { name: "Embassy Medical Exam", status: "pending", dueDate: "Dec 15, 2024" },
        { name: "Visa Approval", status: "pending", dueDate: "Dec 30, 2024" }
      ]
    },
    {
      category: "University Application",
      total: 6,
      completed: 4,
      progress: 67,
      color: "text-green-600",
      documents: [
        { name: "Common Application", status: "completed", dueDate: "N/A" },
        { name: "Academic Transcripts", status: "completed", dueDate: "N/A" },
        { name: "Letters of Recommendation", status: "completed", dueDate: "N/A" },
        { name: "Personal Statement", status: "completed", dueDate: "N/A" },
        { name: "Application Fee Payment", status: "pending", dueDate: "Jan 1, 2025" },
        { name: "Portfolio Submission", status: "overdue", dueDate: "Dec 1, 2024" }
      ]
    },
    {
      category: "Financial Aid",
      total: 5,
      completed: 2,
      progress: 40,
      color: "text-purple-600",
      documents: [
        { name: "FAFSA Application", status: "completed", dueDate: "N/A" },
        { name: "CSS Profile", status: "completed", dueDate: "N/A" },
        { name: "Tax Returns", status: "pending", dueDate: "Jan 15, 2025" },
        { name: "Bank Statements", status: "pending", dueDate: "Jan 15, 2025" },
        { name: "Scholarship Applications", status: "pending", dueDate: "Feb 1, 2025" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

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
              Document Tracker
            </h1>
            <p className="text-muted-foreground">
              Never miss a deadline with intelligent document tracking
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Search className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Stay Organized, Never Miss a Deadline</h2>
                <p className="text-white/90">
                  Our intelligent document tracking system monitors your application progress, sends reminders, 
                  and ensures you never miss important deadlines in your journey to study in the U.S.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">19</div>
                <div className="text-sm text-white/80">Documents Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">12</div>
                <div className="text-sm text-white/80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">6</div>
                <div className="text-sm text-white/80">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">1</div>
                <div className="text-sm text-white/80">Overdue</div>
              </div>
            </div>
            
            <Button variant="secondary" size="lg" className="mt-4">
              View My Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Document Progress</h2>
          <div className="space-y-6">
            {documentCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{category.category}</CardTitle>
                      <p className="text-muted-foreground">
                        {category.completed} of {category.total} documents completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${category.color}`}>
                        {category.progress}%
                      </div>
                      <Progress value={category.progress} className="w-20 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(doc.status)}
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.dueDate !== "N/A" && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {doc.dueDate}
                            </div>
                          )}
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Smart Tracking Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Deadline Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Get email and SMS reminders before important deadlines
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <FileText className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Document Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Access templates and examples for required documents
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Visual progress bars show completion status at a glance
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Calendar Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Sync deadlines with your Google Calendar or other apps
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Priority Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Urgent notifications for overdue or critical documents
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Search className="h-8 w-8 text-info mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  AI suggests next steps based on your current progress
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4">Ready to Get Organized?</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your documents today and take control of your application process. 
              Never miss another deadline with our intelligent tracking system.
            </p>
            <Button size="lg" className="mr-4">
              Start Tracking Documents
            </Button>
            <Button variant="outline" size="lg">
              See Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentTracker;
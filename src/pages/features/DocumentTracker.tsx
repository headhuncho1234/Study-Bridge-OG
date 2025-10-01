import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, CheckCircle, Clock, AlertTriangle, FileText, Calendar } from "lucide-react";
import { useDocumentTracker } from "@/hooks/useDocumentTracker";
import Navbar from "@/components/Navbar";

const DocumentTracker = () => {
  const { documents, updateDocumentStatus, getStats, getCategoryStats, isLoading } = useDocumentTracker();
  
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading document tracker...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="text-3xl font-bold text-yellow-200">{stats.total}</div>
                <div className="text-sm text-white/80">Documents Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">{stats.completed}</div>
                <div className="text-sm text-white/80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">{stats.pending}</div>
                <div className="text-sm text-white/80">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">{stats.overdue}</div>
                <div className="text-sm text-white/80">Overdue</div>
              </div>
            </div>
            
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Document Progress</h2>
          <div className="space-y-6">
            {documents.map((category, index) => {
              const categoryStats = getCategoryStats(category.category);
              const getColor = (categoryName: string) => {
                switch(categoryName) {
                  case "Visa Documents": return "text-blue-600";
                  case "University Application": return "text-green-600";
                  case "Financial Aid": return "text-purple-600";
                  default: return "text-primary";
                }
              };
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{category.category}</CardTitle>
                        <p className="text-muted-foreground">
                          {categoryStats.completed} of {categoryStats.total} documents completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getColor(category.category)}`}>
                          {categoryStats.progress}%
                        </div>
                        <Progress value={categoryStats.progress} className="w-20 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={doc.status === 'completed'}
                              onCheckedChange={(checked) => {
                                const newStatus = checked ? 'completed' : 'pending';
                                updateDocumentStatus(doc.id, newStatus);
                              }}
                            />
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
              );
            })}
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
              <Button size="lg">
                Start Tracking Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentTracker;
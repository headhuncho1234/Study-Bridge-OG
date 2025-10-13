import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, ExternalLink, Trash2, Edit, Calendar } from "lucide-react";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SavedScholarships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedScholarships, isLoading, unsaveScholarship, updateScholarshipStatus, updatePriority } = useSavedScholarships(user?.id);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const groupedScholarships = {
    saved: savedScholarships.filter(s => s.application_status === 'saved'),
    in_progress: savedScholarships.filter(s => s.application_status === 'in_progress'),
    submitted: savedScholarships.filter(s => s.application_status === 'submitted'),
    awarded: savedScholarships.filter(s => s.application_status === 'awarded'),
  };

  const priorityScholarships = {
    high: savedScholarships.filter(s => s.priority === 1),
    medium: savedScholarships.filter(s => s.priority === 2),
    low: savedScholarships.filter(s => s.priority === 3),
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-500";
      case 2: return "text-yellow-500";
      case 3: return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved': return "bg-gray-500";
      case 'in_progress': return "bg-blue-500";
      case 'submitted': return "bg-purple-500";
      case 'awarded': return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const handleStatusChange = async (savedId: string, newStatus: string) => {
    await updateScholarshipStatus(savedId, newStatus);
  };

  const handlePriorityChange = async (savedId: string, newPriority: number) => {
    await updatePriority(savedId, newPriority);
  };

  const handleSaveNotes = async (savedId: string) => {
    await updateScholarshipStatus(savedId, savedScholarships.find(s => s.id === savedId)?.application_status || 'saved', noteText);
    setEditingNotes(null);
    setNoteText("");
  };

  const renderScholarshipCard = (saved: any) => {
    const scholarship = saved.scholarship;
    if (!scholarship) return null;

    return (
      <Card key={saved.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">{scholarship.title}</CardTitle>
              <CardDescription>
                {scholarship.provider} • {scholarship.amount}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={saved.priority.toString()}
                onValueChange={(value) => handlePriorityChange(saved.id, parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => unsaveScholarship(scholarship.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getStatusColor(saved.application_status)} text-white`}>
              {saved.application_status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(saved.priority)}>
              {saved.priority === 1 ? 'High' : saved.priority === 2 ? 'Medium' : 'Low'} Priority
            </Badge>
            {scholarship.deadline && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(scholarship.deadline), 'MMM dd, yyyy')}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Select
              value={saved.application_status}
              onValueChange={(value) => handleStatusChange(saved.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editingNotes === saved.id ? (
            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveNotes(saved.id)}>
                  Save Notes
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingNotes(null);
                  setNoteText("");
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {saved.notes && (
                <p className="text-sm text-muted-foreground mb-2">{saved.notes}</p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingNotes(saved.id);
                  setNoteText(saved.notes || "");
                }}
              >
                <Edit className="h-3 w-3 mr-2" />
                {saved.notes ? 'Edit Notes' : 'Add Notes'}
              </Button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {scholarship.application_link && (
              <Button
                size="sm"
                onClick={() => window.open(scholarship.application_link, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your saved scholarships.
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Saved Scholarships</h1>
            <p className="text-muted-foreground">
              Track and manage your scholarship applications
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Saved</CardDescription>
              <CardTitle className="text-3xl">{savedScholarships.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{groupedScholarships.in_progress.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Submitted</CardDescription>
              <CardTitle className="text-3xl">{groupedScholarships.submitted.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Awarded</CardDescription>
              <CardTitle className="text-3xl text-green-500">{groupedScholarships.awarded.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
            <TabsTrigger value="deadline">By Deadline</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            {Object.entries(groupedScholarships).map(([status, scholarships]) => (
              <div key={status}>
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {status.replace('_', ' ')} ({scholarships.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholarships.map(renderScholarshipCard)}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="priority" className="space-y-6">
            {Object.entries(priorityScholarships).map(([priority, scholarships]) => (
              <div key={priority}>
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {priority} Priority ({scholarships.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholarships.map(renderScholarshipCard)}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="deadline" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedScholarships
                .sort((a, b) => {
                  const dateA = a.scholarship?.deadline ? new Date(a.scholarship.deadline).getTime() : 0;
                  const dateB = b.scholarship?.deadline ? new Date(b.scholarship.deadline).getTime() : 0;
                  return dateA - dateB;
                })
                .map(renderScholarshipCard)}
            </div>
          </TabsContent>
        </Tabs>

        {savedScholarships.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Saved Scholarships</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring scholarships and save the ones you're interested in.
              </p>
              <Button onClick={() => navigate('/features/scholarship-database')}>
                Browse Scholarships
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SavedScholarships;

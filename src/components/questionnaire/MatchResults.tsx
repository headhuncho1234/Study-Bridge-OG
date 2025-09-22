import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GraduationCap, 
  DollarSign, 
  MapPin, 
  Calendar,
  Award,
  ExternalLink,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface MatchData {
  generated_at: string;
  profile_summary: Record<string, any>;
  matches: {
    name: string;
    city: string;
    state: string;
    unit_id: string | null;
    match_score: number;
    fit: {
      academic: number;
      program: number;
      financial: number;
      location: number;
      culture: number;
    };
    why_match: string;
    suggested_next_steps: string[];
    application_deadline: {
      type: string;
      date: string | null;
      needs_verification: boolean;
    };
    estimated_net_price: {
      value: number | string | null;
      currency: string;
      needs_verification: boolean;
    };
    scholarship_matches: {
      name: string;
      award_range: string;
      eligibility_summary: string;
      deadline: string | null;
      needs_verification: boolean;
      match_score: number;
    }[];
  }[];
  scholarship_recommendations: {
    name: string;
    award_range: string;
    eligibility: string;
    deadline: string | null;
    application_link: string | null;
    needs_verification: boolean;
    match_score: number;
  }[];
  assumptions: string[];
  notes: string;
}

interface MatchResultsProps {
  data: MatchData;
  onStartNew: () => void;
}

const MatchResults = ({ data, onStartNew }: MatchResultsProps) => {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("match_score");
  const [showTop5Only, setShowTop5Only] = useState(true);

  const sortedMatches = [...data.matches].sort((a, b) => {
    switch (sortBy) {
      case "match_score":
        return b.match_score - a.match_score;
      case "cost":
        const aPrice = typeof a.estimated_net_price.value === 'number' ? a.estimated_net_price.value : 0;
        const bPrice = typeof b.estimated_net_price.value === 'number' ? b.estimated_net_price.value : 0;
        return aPrice - bPrice;
      case "location":
        return a.state.localeCompare(b.state);
      default:
        return b.match_score - a.match_score;
    }
  });

  const displayMatches = showTop5Only ? sortedMatches.slice(0, 5) : sortedMatches;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-success text-success-foreground";
    if (score >= 80) return "bg-accent text-accent-foreground";
    if (score >= 70) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const formatPrice = (price: any) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price || "Contact school";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Your U.S. University Matches
        </h2>
        <p className="text-muted-foreground">
          AI-generated recommendations based on your profile
        </p>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Major</p>
              <p className="font-medium">{data.profile_summary.major}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GPA</p>
              <p className="font-medium">{data.profile_summary.GPA}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrollment</p>
              <p className="font-medium">{data.profile_summary.enrollmentType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">{data.profile_summary.budget || "Flexible"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select onValueChange={setSortBy} defaultValue="match_score">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match_score">Sort by Match Score</SelectItem>
              <SelectItem value="cost">Sort by Cost (Low to High)</SelectItem>
              <SelectItem value="location">Sort by Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowTop5Only(!showTop5Only)}
        >
          {showTop5Only ? "Show All Matches" : "Show Top 5"}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={async () => {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;
            
            const element = document.getElementById('results-content');
            if (element) {
              const canvas = await html2canvas(element);
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF();
              const imgWidth = 210;
              const pageHeight = 295;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              let heightLeft = imgHeight;
              let position = 0;

              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;

              while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
              }

              pdf.save(`university-matches-${new Date().toISOString().split('T')[0]}.pdf`);
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Matches */}
      <div id="results-content" className="space-y-4">
        {displayMatches.map((match, index) => (
          <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{match.name}</CardTitle>
                    <Badge className={getScoreColor(match.match_score)}>
                      {match.match_score}% Match
                    </Badge>
                    {index < 5 && (
                      <Badge variant="secondary">Top {index + 1}</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {match.city}, {match.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(match.estimated_net_price.value)}
                      {match.estimated_net_price.needs_verification && " *"}
                    </div>
                    {match.application_deadline.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {match.application_deadline.type}: {match.application_deadline.date}
                        {match.application_deadline.needs_verification && " *"}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm mb-3">{match.why_match}</p>
                  
                  {/* Fit Breakdown */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Object.entries(match.fit).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className="text-xs text-muted-foreground capitalize mb-1">
                          {category}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Expanded View Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMatch(selectedMatch === index ? null : index)}
                className="mb-4"
              >
                {selectedMatch === index ? "Show Less" : "Show Details"}
              </Button>
              
              {selectedMatch === index && (
                <div className="space-y-4">
                  <Separator />
                  
                  {/* Next Steps */}
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Next Steps</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.suggested_next_steps.map((step, stepIndex) => (
                        <Badge key={stepIndex} variant="secondary">
                          {step}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* School-specific Scholarships */}
                  {match.scholarship_matches.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">School-Specific Scholarships</h4>
                      <div className="space-y-2">
                        {match.scholarship_matches.map((scholarship, schIndex) => (
                          <div key={schIndex} className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{scholarship.name}</p>
                                <p className="text-sm text-muted-foreground">{scholarship.eligibility_summary}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={getScoreColor(scholarship.match_score)}>
                                  {scholarship.match_score}% Match
                                </Badge>
                                <p className="text-sm font-medium mt-1">{scholarship.award_range}</p>
                                {scholarship.deadline && (
                                  <p className="text-xs text-muted-foreground">
                                    Due: {scholarship.deadline}
                                    {scholarship.needs_verification && " *"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Scholarships */}
      {data.scholarship_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Additional Scholarship Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {data.scholarship_recommendations.slice(0, 6).map((scholarship, index) => (
                <div key={index} className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{scholarship.name}</h4>
                    <Badge className={getScoreColor(scholarship.match_score)}>
                      {scholarship.match_score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{scholarship.eligibility}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">{scholarship.award_range}</span>
                    {scholarship.deadline && (
                      <span className="text-xs text-muted-foreground">
                        Due: {scholarship.deadline}
                        {scholarship.needs_verification && " *"}
                      </span>
                    )}
                  </div>
                  {scholarship.application_link && (
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Application Link
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assumptions & Notes */}
      {(data.assumptions.length > 0 || data.notes) && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            {data.assumptions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Assumptions Made</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.assumptions.map((assumption, index) => (
                    <li key={index}>• {assumption}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.notes && (
              <div>
                <h4 className="font-semibold mb-2">Important Notes</h4>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  * Items marked with asterisk (*) need verification from official sources
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button onClick={onStartNew} variant="outline" className="flex-1">
          <RefreshCw className="mr-2 h-4 w-4" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

export default MatchResults;
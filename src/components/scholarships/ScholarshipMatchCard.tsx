import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface ScholarshipMatchCardProps {
  scholarship: {
    id: string;
    title: string;
    provider: string;
    amount: string;
    deadline: string;
    description: string;
    eligibility: string;
    category: string;
    application_link?: string;
    match_score?: number;
    match_reasons?: string[];
  };
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
  onApply?: (id: string, link?: string) => void;
  onViewDetails?: (scholarship: any) => void;
}

const ScholarshipMatchCard = ({
  scholarship,
  isSaved = false,
  onSave,
  onUnsave,
  onApply,
  onViewDetails,
}: ScholarshipMatchCardProps) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Potential Match";
  };

  const handleApply = () => {
    if (onApply) {
      onApply(scholarship.id, scholarship.application_link);
    } else if (scholarship.application_link) {
      window.open(scholarship.application_link, '_blank');
    }
  };

  const handleToggleSave = () => {
    if (isSaved && onUnsave) {
      onUnsave(scholarship.id);
    } else if (!isSaved && onSave) {
      onSave(scholarship.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{scholarship.title}</CardTitle>
              {scholarship.match_score !== undefined && (
                <Badge className={`${getMatchColor(scholarship.match_score)} text-white`}>
                  {scholarship.match_score}% Match
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              <span>{scholarship.provider}</span>
              <span>•</span>
              <span className="font-semibold text-primary">{scholarship.amount}</span>
            </CardDescription>
          </div>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="icon"
            onClick={handleToggleSave}
            className="shrink-0"
          >
            <Star className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Match Reasons */}
        {scholarship.match_reasons && scholarship.match_reasons.length > 0 && (
          <div className="bg-accent/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              Why This Match?
            </div>
            <ul className="space-y-1">
              {scholarship.match_reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {scholarship.description}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{scholarship.category}</Badge>
          <Badge variant="outline">
            Deadline: {format(new Date(scholarship.deadline), 'MMM dd, yyyy')}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(scholarship)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScholarshipMatchCard;

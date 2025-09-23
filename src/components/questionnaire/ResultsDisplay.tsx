import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Clock, Users, ExternalLink, Home, Award, FileText } from "lucide-react";

interface UniversityMatch {
  name: string;
  location: string;
  match_score: number;
  tuition: string;
  acceptance_rate: string;
  ranking?: string;
  programs: string[];
  campus_size: string;
  description: string;
  application_deadline: string;
  requirements: string[];
}

interface ScholarshipMatch {
  name: string;
  sponsor: string;
  amount: string;
  deadline: string;
  match_score: number;
  difficulty: string;
  requirements: string[];
  essays_required: number;
  application_link?: string;
  tips: string;
}

interface HousingRecommendation {
  name: string;
  address?: string;
  rent: string;
  distance: string;
  type: string;
  amenities: string[];
  pros: string[];
  cons: string[];
  contact: string;
  match_score: number;
  rating?: number;
}

interface UniversityResults {
  profile: any;
  matches: UniversityMatch[];
  application_tips: any;
  timeline: any;
}

interface ScholarshipResults {
  profile: any;
  scholarships: ScholarshipMatch[];
  strategy: any;
  essay_guidance: any;
}

interface HousingResults {
  profile: string;
  recommendations: HousingRecommendation[];
  tips: string[];
  budget_breakdown: any;
  area_info: any;
}

interface VisaResults {
  profile: string;
  roadmap: any;
  document_checklist: any[];
  timeline: any[];
  interview_prep: any;
  embassy_info: any;
  fees: any;
}

type ResultsData = UniversityResults | ScholarshipResults | HousingResults | VisaResults;

interface ResultsDisplayProps {
  data: ResultsData;
  source?: string;
}

const ResultsDisplay = ({ data, source }: ResultsDisplayProps) => {
  const renderUniversityResults = (results: UniversityResults) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.matches?.map((university, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{university.name}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {university.match_score}% Match
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{university.location}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tuition:</span>
                  <div className="font-medium">{university.tuition}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Acceptance Rate:</span>
                  <div className="font-medium">{university.acceptance_rate}</div>
                </div>
                {university.ranking && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Ranking:</span>
                    <div className="font-medium">{university.ranking}</div>
                  </div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Campus Size:</span>
                <div className="text-sm">{university.campus_size}</div>
              </div>
              <p className="text-sm text-muted-foreground">{university.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {university.programs?.slice(0, 3).map((program, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {program}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderScholarshipResults = (results: ScholarshipResults) => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {results.scholarships?.map((scholarship, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    {scholarship.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{scholarship.sponsor}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {scholarship.match_score}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <div className="text-sm text-muted-foreground">Award Amount</div>
                    <div className="font-medium">{scholarship.amount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Deadline</div>
                    <div className="font-medium">{scholarship.deadline}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Essays Required</div>
                    <div className="font-medium">{scholarship.essays_required}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <Badge variant="outline" className={
                  scholarship.difficulty === 'Low' ? 'border-success text-success' :
                  scholarship.difficulty === 'Medium' ? 'border-primary text-primary' :
                  'border-destructive text-destructive'
                }>
                  {scholarship.difficulty} Difficulty
                </Badge>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Requirements:</div>
                <div className="flex flex-wrap gap-1">
                  {scholarship.requirements.map((req, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-accent/10 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Application Tip:</div>
                <p className="text-sm text-muted-foreground">{scholarship.tips}</p>
              </div>
              
              {scholarship.application_link && (
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHousingResults = (results: HousingResults) => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {results.recommendations?.map((housing, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    {housing.name}
                  </CardTitle>
                  {housing.address && (
                    <p className="text-muted-foreground text-sm mt-1">{housing.address}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {housing.match_score}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Rent</div>
                    <div className="font-medium">{housing.rent}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div className="font-medium">{housing.distance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium">{housing.type}</div>
                  </div>
                </div>
              </div>

              {housing.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent fill-current" />
                  <span className="font-medium">{housing.rating}/5</span>
                  <span className="text-muted-foreground text-sm">Rating</span>
                </div>
              )}
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Amenities:</div>
                <div className="flex flex-wrap gap-1">
                  {housing.amenities.map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {housing.pros.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-success mb-1">Pros:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {housing.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-success rounded-full"></span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {housing.cons.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-destructive mb-1">Cons:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {housing.cons.map((con, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-destructive rounded-full"></span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-primary/10 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Contact:</div>
                <p className="text-sm text-muted-foreground">{housing.contact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVisaResults = (results: VisaResults) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visa Preparation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{results.profile}</p>
        </CardContent>
      </Card>
      
      {/* Document Checklist */}
      {results.document_checklist && (
        <Card>
          <CardHeader>
            <CardTitle>Document Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.document_checklist.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{doc.document}</div>
                    <p className="text-sm text-muted-foreground">{doc.instructions}</p>
                  </div>
                  <Badge variant={doc.status === 'ready' ? 'default' : 'outline'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline */}
      {results.timeline && (
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.timeline.map((phase, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <div className="font-medium">{phase.phase}</div>
                  <div className="text-sm text-muted-foreground">{phase.duration}</div>
                  <ul className="mt-2 space-y-1">
                    {phase.tasks?.map((task, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Determine result type and render accordingly
  if ('matches' in data) {
    return renderUniversityResults(data as UniversityResults);
  } else if ('scholarships' in data) {
    return renderScholarshipResults(data as ScholarshipResults);
  } else if ('recommendations' in data) {
    return renderHousingResults(data as HousingResults);
  } else if ('roadmap' in data || 'document_checklist' in data) {
    return renderVisaResults(data as VisaResults);
  }

  return <div>No results to display</div>;
};

export default ResultsDisplay;
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Users, 
  Award, 
  GraduationCap,
  Building,
  Star,
  Calendar,
  TrendingUp
} from "lucide-react";

interface DetailedInfo {
  campus_life: string;
  research_opportunities: string;
  career_services: string;
  notable_alumni: string[];
  student_faculty_ratio: string;
  retention_rate: string;
  graduation_rate: string;
  facilities: string[];
}

interface SchoolScholarship {
  name: string;
  amount: string;
  eligibility: string;
  deadline: string;
  renewable: boolean;
  application_link: string;
}

interface SchoolScholarships {
  merit_scholarships: SchoolScholarship[];
  need_based: SchoolScholarship[];
  program_specific: SchoolScholarship[];
}

interface UniversityMatch {
  name: string;
  location: string;
  match_score: number;
  tuition: string;
  acceptance_rate: string;
  ranking?: string;
  programs: string[];
  campus_size: string;
  student_body?: number;
  description: string;
  application_deadline: string;
  requirements: string[];
  website?: string;
  personalized_summary?: string;
  detailed_info?: DetailedInfo;
  school_scholarships?: SchoolScholarships;
}

interface SchoolDetailModalProps {
  school: UniversityMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

const SchoolDetailModal = ({ school, isOpen, onClose }: SchoolDetailModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!school) return null;

  const renderScholarshipSection = (scholarships: SchoolScholarship[], title: string) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">{title}</h4>
      {scholarships.map((scholarship, idx) => (
        <Card key={idx} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                {scholarship.name}
              </CardTitle>
              <Badge variant="secondary" className="text-sm font-medium">
                {scholarship.amount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Eligibility:</span>
                <p className="font-medium">{scholarship.eligibility}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Deadline:</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {scholarship.deadline}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant={scholarship.renewable ? "default" : "outline"}>
                {scholarship.renewable ? "Renewable" : "One-time"}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Apply
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">{school.name}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{school.location}</span>
                {school.ranking && (
                  <>
                    <span>•</span>
                    <span className="text-accent font-medium">{school.ranking}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {school.match_score}% Match
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="campus">Campus Life</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {school.personalized_summary && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Why This School Matches You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{school.personalized_summary}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tuition</div>
                      <div className="font-medium">{school.tuition}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                      <div className="font-medium">{school.acceptance_rate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <div>
                      <div className="text-sm text-muted-foreground">Student Body</div>
                      <div className="font-medium">
                        {school.student_body ? school.student_body.toLocaleString() : school.campus_size}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About {school.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{school.description}</p>
                <div className="flex flex-wrap gap-2">
                  {school.programs?.slice(0, 5).map((program, idx) => (
                    <Badge key={idx} variant="outline">
                      {program}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {school.website && (
                <Button asChild>
                  <a href={school.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit University Website
                  </a>
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="academics" className="space-y-6 mt-6">
            {school.detailed_info && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Student-Faculty Ratio</div>
                      <div className="font-medium text-lg">{school.detailed_info.student_faculty_ratio}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Graduation Rate</div>
                      <div className="font-medium text-lg">{school.detailed_info.graduation_rate}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Programs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {school.programs?.map((program, idx) => (
                        <Badge key={idx} variant="secondary">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Research Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{school.detailed_info.research_opportunities}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Career Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{school.detailed_info.career_services}</p>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Application Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {school.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span className="text-muted-foreground">{req}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-accent/10 rounded-md">
                  <div className="text-sm font-medium">Application Deadline</div>
                  <div className="text-muted-foreground">{school.application_deadline}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campus" className="space-y-6 mt-6">
            {school.detailed_info && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Campus Life
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{school.detailed_info.campus_life}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campus Facilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {school.detailed_info.facilities?.map((facility, idx) => (
                        <Badge key={idx} variant="outline">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notable Alumni</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {school.detailed_info.notable_alumni?.map((alumni, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-accent" />
                          <span className="text-muted-foreground">{alumni}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Retention Rate</div>
                      <div className="font-medium text-lg">{school.detailed_info.retention_rate}</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="scholarships" className="space-y-6 mt-6">
            {school.school_scholarships ? (
              <div className="space-y-8">
                {school.school_scholarships.merit_scholarships?.length > 0 && 
                  renderScholarshipSection(school.school_scholarships.merit_scholarships, "Merit-Based Scholarships")}
                
                {school.school_scholarships.need_based?.length > 0 && 
                  renderScholarshipSection(school.school_scholarships.need_based, "Need-Based Aid")}
                
                {school.school_scholarships.program_specific?.length > 0 && 
                  renderScholarshipSection(school.school_scholarships.program_specific, "Program-Specific Scholarships")}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Scholarship information not available for this university.</p>
                    <p className="text-sm mt-2">Visit the university website for more details on financial aid opportunities.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailModal;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, Clock, Users, ExternalLink, Home, Award, FileText, Info, Bookmark, BookmarkCheck } from "lucide-react";
import SchoolDetailModal from "./SchoolDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSchool, setSelectedSchool] = useState<UniversityMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSchools, setSavedSchools] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadSavedSchools();
    }
  }, [user]);

  const loadSavedSchools = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('questionnaire_results')
        .eq('user_id', user.id)
        .single();

      if (profile?.questionnaire_results) {
        const results = profile.questionnaire_results as any;
        setSavedSchools(results.saved_schools || []);
      }
    } catch (error) {
      console.error('Error loading saved schools:', error);
    }
  };

  const toggleSaveSchool = async (schoolName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save schools to your profile.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('questionnaire_results')
        .eq('user_id', user.id)
        .single();

      const currentResults = (profile?.questionnaire_results as any) || {};
      const currentSaved = currentResults.saved_schools || [];
      
      let newSaved;
      if (currentSaved.includes(schoolName)) {
        newSaved = currentSaved.filter((name: string) => name !== schoolName);
      } else {
        newSaved = [...currentSaved, schoolName];
      }

      const updatedResults = {
        ...currentResults,
        saved_schools: newSaved
      };

      const { error } = await supabase
        .from('profiles')
        .update({ questionnaire_results: updatedResults })
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSchools(newSaved);
      
      toast({
        title: currentSaved.includes(schoolName) ? "School removed" : "School saved",
        description: currentSaved.includes(schoolName) 
          ? "School removed from your saved list" 
          : "School saved to your profile"
      });

    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "Error",
        description: "Could not save school. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSchoolClick = (university: UniversityMatch) => {
    setSelectedSchool(university);
    setIsModalOpen(true);
  };

  const formatTuition = (tuition: string) => {
    // Handle undefined, null, or empty tuition values
    if (!tuition || typeof tuition !== 'string') {
      return 'Not specified';
    }
    
    // Extract number from tuition string and format as currency
    const numMatch = tuition.match(/[\d,]+/);
    if (numMatch) {
      const num = parseInt(numMatch[0].replace(/,/g, ''));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    }
    return tuition;
  };

  const getDifficultyColor = (acceptanceRate: string) => {
    const rate = parseFloat(acceptanceRate.replace('%', ''));
    if (rate < 15) return 'border-red-500 text-red-600 bg-red-50';
    if (rate < 30) return 'border-orange-500 text-orange-600 bg-orange-50';
    if (rate < 50) return 'border-yellow-500 text-yellow-600 bg-yellow-50';
    return 'border-green-500 text-green-600 bg-green-50';
  };

  const renderUniversityResults = (results: UniversityResults) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Your Personalized University Matches
        </h2>
        <p className="text-muted-foreground">
          Based on your preferences, here are universities that match your criteria
        </p>
      </div>

      <div className="grid gap-6">
        {results.matches?.map((university, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-primary hover:underline cursor-pointer">
                    <button 
                      onClick={() => handleSchoolClick(university)}
                      className="text-left hover:underline"
                    >
                      {university.name}
                    </button>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{university.location}</span>
                  </div>
                  {university.ranking && (
                    <div className="text-sm font-medium text-accent mt-1">
                      {university.ranking}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="ml-2">
                    {university.match_score}% Match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveSchool(university.name);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {savedSchools.includes(university.name) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-muted-foreground">Tuition</div>
                    <div className="font-bold text-green-600">
                      {formatTuition(university.tuition)}/year
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-muted-foreground">Acceptance Rate</div>
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(university.acceptance_rate)}
                    >
                      {university.acceptance_rate}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-muted-foreground">Campus Size</div>
                    <div className="font-medium">{university.campus_size}</div>
                  </div>
                </div>
                {university.student_body && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-muted-foreground">Students</div>
                      <div className="font-medium">
                        {university.student_body.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {university.personalized_summary && (
                <div className="bg-primary/10 p-3 rounded-md">
                  <div className="text-sm font-medium text-primary mb-1">Why This School Matches You:</div>
                  <p className="text-sm text-muted-foreground">{university.personalized_summary}</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                {university.description}
              </p>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Available Programs:</div>
                <div className="flex flex-wrap gap-1">
                  {university.programs?.slice(0, 4).map((program, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                  {university.programs && university.programs.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{university.programs.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {university.school_scholarships && (
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Available Scholarships:
                  </div>
                  {university.school_scholarships.merit_scholarships?.slice(0, 2).map((scholarship, idx) => (
                    <div key={idx} className="text-xs text-green-700 dark:text-green-300">
                      • {scholarship.name}: {scholarship.amount} ({scholarship.eligibility})
                    </div>
                  ))}
                  {university.school_scholarships.need_based?.slice(0, 1).map((scholarship, idx) => (
                    <div key={idx} className="text-xs text-green-700 dark:text-green-300">
                      • {scholarship.name}: {scholarship.amount} ({scholarship.eligibility})
                    </div>
                  ))}
                  {university.school_scholarships.program_specific?.slice(0, 1).map((scholarship, idx) => (
                    <div key={idx} className="text-xs text-green-700 dark:text-green-300">
                      • {scholarship.name}: {scholarship.amount} ({scholarship.eligibility})
                    </div>
                  ))}
                </div>
              )}

              {university.detailed_info && (
                <div className="bg-accent/10 p-3 rounded-md">
                  <div className="text-sm font-medium text-primary mb-2">Additional Information:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {university.detailed_info.student_faculty_ratio && (
                      <div>Student-Faculty Ratio: {university.detailed_info.student_faculty_ratio}</div>
                    )}
                    {university.detailed_info.retention_rate && (
                      <div>Retention Rate: {university.detailed_info.retention_rate}</div>
                    )}
                    {university.detailed_info.graduation_rate && (
                      <div>Graduation Rate: {university.detailed_info.graduation_rate}</div>
                    )}
                  </div>
                  {university.detailed_info.facilities && university.detailed_info.facilities.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium mb-1">Key Facilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {university.detailed_info.facilities.slice(0, 3).map((facility, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = university.website || `https://www.google.com/search?q=${encodeURIComponent(university.name + ' official website')}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Official Website
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveSchool(university.name);
                  }}
                  className="px-4"
                >
                  {savedSchools.includes(university.name) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <SchoolDetailModal 
        school={selectedSchool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );

  const renderScholarshipResults = (results: ScholarshipResults) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Your Scholarship Opportunities
        </h2>
        <p className="text-muted-foreground">
          Personalized scholarship matches based on your academic profile and achievements
        </p>
      </div>

      <div className="grid gap-6">
        {results.scholarships?.map((scholarship, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300 border-l-4 border-l-accent">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-accent" />
                    {scholarship.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{scholarship.sponsor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="ml-2">
                    {scholarship.match_score}% Match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveSchool(scholarship.name);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {savedSchools.includes(scholarship.name) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Award Amount</div>
                    <div className="font-bold text-green-600">{scholarship.amount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Deadline</div>
                    <div className="font-medium">{scholarship.deadline}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Essays Required</div>
                    <div className="font-medium">{scholarship.essays_required}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <Badge variant="outline" className={
                  scholarship.difficulty === 'Low' ? 'border-green-500 text-green-600 bg-green-50' :
                  scholarship.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                  'border-red-500 text-red-600 bg-red-50'
                }>
                  {scholarship.difficulty} Difficulty
                </Badge>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Requirements:</div>
                <div className="flex flex-wrap gap-1">
                  {scholarship.requirements?.map((req, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  )) || (
                    <span className="text-xs text-muted-foreground">No specific requirements listed</span>
                  )}
                </div>
              </div>
              
              <div className="bg-accent/10 p-3 rounded-md">
                <div className="text-sm font-medium text-primary mb-1">💡 Application Strategy:</div>
                <p className="text-sm text-muted-foreground">{scholarship.tips}</p>
              </div>
              
              <div className="flex gap-2">
                {scholarship.application_link ? (
                  <Button 
                    onClick={() => window.open(scholarship.application_link, '_blank', 'noopener,noreferrer')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(scholarship.name + ' scholarship application')}`, '_blank', 'noopener,noreferrer')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Search Application
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveSchool(scholarship.name);
                  }}
                  className="px-4"
                >
                  {savedSchools.includes(scholarship.name) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHousingResults = (results: HousingResults, isInternational = false) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Your Housing Recommendations
        </h2>
        <p className="text-muted-foreground">
          Curated housing options based on your preferences and budget
        </p>
      </div>

      {/* Guarantor Disclaimer for International Students */}
      {isInternational && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <Info className="h-5 w-5" />
              Important: Guarantor Requirements for International Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-warning/10 p-4 rounded-md">
              <p className="text-sm mb-3">
                <strong>International students are generally required to have a guarantor for leases.</strong> 
                A guarantor must have a valid US social security number and a good credit score to pass 
                the credit check. Since international students may not have SSNs or US credit history, 
                a guarantor is necessary for most leases.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Guarantor Alternatives:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Third-party guarantor services (e.g., Insurent, TheGuarantors)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Graduate assistantships that may waive guarantor requirements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>On-campus housing programs designed for international students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    <span>Security deposit alternatives (larger upfront payments)</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Find Guarantor Services
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Graduate Assistantships
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  International Student Housing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6">
        {results.recommendations?.map((housing, index) => (
          <Card key={index} className="hover:shadow-card transition-all duration-300 border-l-4 border-l-secondary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Home className="h-6 w-6 text-primary" />
                    {housing.name}
                  </CardTitle>
                  {housing.address && (
                    <p className="text-muted-foreground text-sm mt-1">{housing.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="ml-2">
                    {housing.match_score}% Match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveSchool(housing.name);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {savedSchools.includes(housing.name) ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Guarantor Status for International Students */}
              {isInternational && (
                <div className="bg-accent/10 p-3 rounded-md border border-accent/20">
                  <div className="text-sm font-medium text-accent mb-1">Guarantor Requirements:</div>
                  <p className="text-xs text-muted-foreground">
                    {housing.type === 'Dormitory' || housing.type === 'On-Campus' 
                      ? '✅ No guarantor required - University housing'
                      : housing.type === 'Homestay'
                      ? '⚠️ Guarantor may be waived - Contact host family'
                      : '❗ Guarantor required - Consider third-party services'
                    }
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Rent</div>
                    <div className="font-bold text-green-600">{housing.rent}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div className="font-medium">{housing.distance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-secondary" />
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
                  {housing.amenities.slice(0, 6).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {housing.amenities.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{housing.amenities.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>

              {housing.pros && housing.pros.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-green-600 mb-2">✅ Pros:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {housing.pros.slice(0, 4).map((pro, idx) => (
                      <div key={idx} className="text-xs text-green-700 flex items-center gap-1">
                        <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                        {pro}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {housing.cons && housing.cons.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-600 mb-2">⚠️ Considerations:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {housing.cons.slice(0, 4).map((con, idx) => (
                      <div key={idx} className="text-xs text-red-700 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {con}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Contact Information:</div>
                <p className="text-sm text-muted-foreground">{housing.contact}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(housing.name + ' ' + housing.address)}`, '_blank', 'noopener,noreferrer')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search Online
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveSchool(housing.name);
                  }}
                  className="px-4"
                >
                  {savedSchools.includes(housing.name) ? 'Saved' : 'Save'}
                </Button>
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
    const housingData = data as HousingResults;
    // Check if source indicates international student status
    const isInternational = source?.includes('international') || 
      (housingData.profile && housingData.profile.toLowerCase().includes('international'));
    return renderHousingResults(housingData, isInternational);
  } else if ('roadmap' in data || 'document_checklist' in data) {
    return renderVisaResults(data as VisaResults);
  }

  return <div>No results to display</div>;
};

export default ResultsDisplay;
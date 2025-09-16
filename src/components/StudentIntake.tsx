import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, User, GraduationCap, DollarSign, Globe, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentIntake = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    fieldOfStudy: "",
    degreeLevel: "",
    budget: "",
    preferredCountries: [] as string[],
    housingPreference: "",
    scholarshipInterest: false
  });

  const totalSteps = 5;

  const generatePersonalizedRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    
    try {
      const prompt = `You are StudyBridge AI, an expert advisor for international students seeking to study in the United States. Based on this student profile, generate a comprehensive and personalized study plan with specific US university recommendations:

Student Profile:
- Name: ${formData.name}
- Country of Origin: ${formData.country}
- Field of Study: ${formData.fieldOfStudy}
- Degree Level: ${formData.degreeLevel}
- Budget: ${formData.budget}
- Preferred US Regions: ${formData.preferredCountries.join(", ")}
- Housing Preference: ${formData.housingPreference}
- Scholarship Interest: ${formData.scholarshipInterest ? "Yes" : "No"}

Please provide a detailed response with:

1. **TOP 5 US UNIVERSITIES** - Specific university names with:
   - Why each university fits this student's profile
   - Admission requirements and deadlines
   - Approximate tuition costs and living expenses
   - Notable programs in their field of study

2. **SCHOLARSHIP OPPORTUNITIES** - Include:
   - University-specific scholarships at recommended schools
   - External scholarships for international students
   - Merit-based and need-based options
   - Application deadlines and requirements

3. **APPLICATION TIMELINE** - Month-by-month plan including:
   - Standardized test preparation (TOEFL/IELTS, GRE/GMAT, SAT)
   - Application deadlines for recommended universities
   - Visa application process timeline
   - Financial documentation preparation

4. **VISA GUIDANCE** - F-1 student visa requirements:
   - Required documents and forms
   - Interview preparation tips
   - Financial proof requirements
   - Timeline for visa application

5. **FINANCIAL PLANNING** - Detailed breakdown:
   - Estimated total costs for each recommended university
   - Cost of living in different US regions
   - Part-time work opportunities (on-campus jobs, CPT, OPT)
   - Banking and financial setup advice

6. **HOUSING & LIVING** - Practical advice:
   - On-campus vs off-campus housing pros/cons
   - Average housing costs in recommended university areas
   - Cultural adaptation tips for US college life
   - Essential items to bring/buy in the US

Format as clear sections with bullet points and specific actionable advice. Be comprehensive but practical.`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: prompt }
      });

      if (error) {
        throw error;
      }

      setAiRecommendations(data.response);
      setCurrentStep(5); // Move to results step
      
      toast({
        title: "Personalized Roadmap Generated! ✨",
        description: "Your AI-powered recommendations are ready!"
      });
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. There was an issue generating your roadmap.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      generatePersonalizedRoadmap();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredCountries: checked 
        ? [...prev.preferredCountries, country]
        : prev.preferredCountries.filter(c => c !== country)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Personal Information</h3>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country of Origin</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="china">China</SelectItem>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="brazil">Brazil</SelectItem>
                    <SelectItem value="mexico">Mexico</SelectItem>
                    <SelectItem value="south-korea">South Korea</SelectItem>
                    <SelectItem value="bangladesh">Bangladesh</SelectItem>
                    <SelectItem value="pakistan">Pakistan</SelectItem>
                    <SelectItem value="vietnam">Vietnam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Academic Goals</h3>
              <p className="text-muted-foreground">What do you want to study?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, fieldOfStudy: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your field of interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science & Information Technology</SelectItem>
                    <SelectItem value="engineering">Engineering (All Disciplines)</SelectItem>
                    <SelectItem value="business">Business Administration & Management</SelectItem>
                    <SelectItem value="medicine">Medicine & Health Sciences</SelectItem>
                    <SelectItem value="liberal-arts">Liberal Arts & Humanities</SelectItem>
                    <SelectItem value="social-sciences">Social Sciences & Psychology</SelectItem>
                    <SelectItem value="stem">STEM Fields (Science, Technology, Engineering, Math)</SelectItem>
                    <SelectItem value="economics">Economics & Finance</SelectItem>
                    <SelectItem value="law">Pre-Law & Legal Studies</SelectItem>
                    <SelectItem value="communications">Communications & Media Studies</SelectItem>
                    <SelectItem value="education">Education & Teaching</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="degreeLevel">Degree Level</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, degreeLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="certificate">Certificate Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scholarship"
                  checked={formData.scholarshipInterest}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scholarshipInterest: checked as boolean }))}
                />
                <Label htmlFor="scholarship">I'm interested in scholarship opportunities</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Financial Planning</h3>
              <p className="text-muted-foreground">Help us match you with affordable options</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget">Annual Budget (USD)</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-20k">Under $20,000</SelectItem>
                    <SelectItem value="20k-30k">$20,000 - $30,000</SelectItem>
                    <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                    <SelectItem value="50k-70k">$50,000 - $70,000</SelectItem>
                    <SelectItem value="above-70k">Above $70,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="housingPreference">Housing Preference</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, housingPreference: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select housing preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-campus">On-campus dormitory</SelectItem>
                    <SelectItem value="off-campus-shared">Off-campus shared apartment</SelectItem>
                    <SelectItem value="off-campus-solo">Off-campus solo apartment</SelectItem>
                    <SelectItem value="homestay">Homestay with local family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Destination Preferences</h3>
              <p className="text-muted-foreground">Which US regions interest you most?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Preferred US Regions (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-4">
                {["Northeast (NY, MA, CT)", "Southeast (FL, GA, NC)", "Midwest (IL, MI, OH)", "Southwest (TX, AZ, NM)", "West Coast (CA, WA, OR)", "Mountain West (CO, UT, NV)"].map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox 
                      id={country}
                      checked={formData.preferredCountries.includes(country)}
                      onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
                    />
                    <Label htmlFor={country}>{country}</Label>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Top 5 US university recommendations with admission details</li>
                  <li>• Specific scholarships for international students</li>
                  <li>• Complete F-1 visa application timeline</li>
                  <li>• Financial planning and cost breakdowns</li>
                  <li>• Housing options and cultural adaptation tips</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Your US University Roadmap</h3>
              <p className="text-muted-foreground">AI-generated plan for studying in America</p>
            </div>
            
            {isGeneratingRoadmap ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Generating your personalized roadmap...</p>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-foreground">
                    {aiRecommendations}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Find Your Perfect US University
          </h2>
          <p className="text-muted-foreground text-lg">
            Get AI-powered recommendations for studying in the United States
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Step {currentStep} of {totalSteps}</CardTitle>
              <div className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 5 && (
                <Button 
                  onClick={handleNext}
                  disabled={isGeneratingRoadmap}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  {isGeneratingRoadmap ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {currentStep === 4 ? "Generate My Roadmap" : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
              
              {currentStep === 5 && (
                <Button 
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({
                      name: "",
                      email: "",
                      country: "",
                      fieldOfStudy: "",
                      degreeLevel: "",
                      budget: "",
                      preferredCountries: [],
                      housingPreference: "",
                      scholarshipInterest: false
                    });
                    setAiRecommendations("");
                  }}
                  variant="outline"
                  className="ml-auto"
                >
                  Start New Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default StudentIntake;
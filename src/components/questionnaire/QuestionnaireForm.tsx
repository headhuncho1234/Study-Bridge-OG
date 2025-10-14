import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface QuestionnaireData {
  major: string;
  customMajor?: string;
  gpa: string;
  preferredLocation: string[];
  budget: string;
  campusSize: string;
  enrollmentType: string;
  extracurriculars: string;
  demographics: string[];
  admissionTimeline: string;
  constraints: string;
}

interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireData) => void;
  isLoading: boolean;
}

const QuestionnaireForm = ({ onSubmit, isLoading }: QuestionnaireFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>({
    major: "",
    customMajor: "",
    gpa: "",
    preferredLocation: [],
    budget: "",
    campusSize: "",
    enrollmentType: "",
    extracurriculars: "",
    demographics: [],
    admissionTimeline: "",
    constraints: ""
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate required fields
      if (!formData.major || !formData.gpa || !formData.enrollmentType) {
        alert("Please complete all required fields: Major, GPA, and Enrollment Type");
        return;
      }
      
      if (formData.major === "other" && !formData.customMajor?.trim()) {
        alert("Please specify your custom major");
        return;
      }
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredLocation: checked 
        ? [...prev.preferredLocation, location]
        : prev.preferredLocation.filter(l => l !== location)
    }));
  };

  const handleDemographicsChange = (demo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      demographics: checked 
        ? [...prev.demographics, demo]
        : prev.demographics.filter(d => d !== demo)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Academic Information</h3>
              <p className="text-muted-foreground">Tell us about your academic background</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="major">Intended Major / Program of Study *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, major: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your intended major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business Administration</SelectItem>
                    <SelectItem value="medicine">Pre-Medicine</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="molecular-science">Molecular Science</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="information-systems">Information Systems</SelectItem>
                    <SelectItem value="liberal-arts">Liberal Arts</SelectItem>
                    <SelectItem value="communications">Communications</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="nursing">Nursing</SelectItem>
                    <SelectItem value="art">Art & Design</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.major === "other" && (
                  <div className="mt-3">
                    <Label htmlFor="customMajor">Please specify your major *</Label>
                    <Input
                      id="customMajor"
                      value={formData.customMajor || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, customMajor: e.target.value }))}
                      placeholder="Enter your intended major or program of study"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="gpa">Current GPA *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gpa: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your GPA range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3.8-4.0">3.8 - 4.0</SelectItem>
                    <SelectItem value="3.5-3.7">3.5 - 3.7</SelectItem>
                    <SelectItem value="3.2-3.4">3.2 - 3.4</SelectItem>
                    <SelectItem value="3.0-3.1">3.0 - 3.1</SelectItem>
                    <SelectItem value="2.7-2.9">2.7 - 2.9</SelectItem>
                    <SelectItem value="below-2.7">Below 2.7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="enrollmentType">Enrollment Type *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, enrollmentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select enrollment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate (Freshman)</SelectItem>
                    <SelectItem value="transfer">Transfer Student</SelectItem>
                    <SelectItem value="graduate">Graduate School</SelectItem>
                    <SelectItem value="online">Online Program</SelectItem>
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
              <h3 className="text-2xl font-bold mb-2">Preferences & Activities</h3>
              <p className="text-muted-foreground">Help us find the best matches for you</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="extracurriculars">Extracurricular Activities & Special Talents</Label>
                <Textarea
                  id="extracurriculars"
                  value={formData.extracurriculars}
                  onChange={(e) => setFormData(prev => ({ ...prev, extracurriculars: e.target.value }))}
                  placeholder="e.g., robotics club captain, varsity tennis, community tutoring, art portfolio..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Preferred U.S. Locations (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    "Northeast (NY, MA, CT, etc.)",
                    "Southeast (FL, GA, NC, etc.)",
                    "Midwest (IL, MI, OH, etc.)",
                    "Southwest (TX, AZ, NM, etc.)",
                    "West Coast (CA, WA, OR)",
                    "Mountain West (CO, UT, NV)",
                    "Anywhere in U.S."
                  ].map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox 
                        id={location}
                        checked={formData.preferredLocation.includes(location)}
                        onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                      />
                      <Label htmlFor={location} className="text-sm">{location}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Maximum Annual Budget (optional)</Label>
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
                    <SelectItem value="no-limit">No specific limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="campusSize">Preferred Campus Size & Setting</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, campusSize: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small-rural">Small campus, rural setting</SelectItem>
                    <SelectItem value="small-suburban">Small campus, suburban setting</SelectItem>
                    <SelectItem value="small-urban">Small campus, urban setting</SelectItem>
                    <SelectItem value="medium-rural">Medium campus, rural setting</SelectItem>
                    <SelectItem value="medium-suburban">Medium campus, suburban setting</SelectItem>
                    <SelectItem value="medium-urban">Medium campus, urban setting</SelectItem>
                    <SelectItem value="large-rural">Large campus, rural setting</SelectItem>
                    <SelectItem value="large-suburban">Large campus, suburban setting</SelectItem>
                    <SelectItem value="large-urban">Large campus, urban setting</SelectItem>
                    <SelectItem value="no-preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Final Details</h3>
              <p className="text-muted-foreground">Almost done! A few more details to personalize your matches</p>
            </div>
            
            <div className="space-y-4">
                <div>
                  <Label>Demographic Information (optional - helps with scholarship matching)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "First-generation college student",
                      "Low-income background",
                      "Veteran or military family",
                      "Underrepresented minority",
                      "International student",
                      "Student with disabilities",
                      "Community volunteer/service"
                    ].map((demo) => (
                    <div key={demo} className="flex items-center space-x-2">
                      <Checkbox 
                        id={demo}
                        checked={formData.demographics.includes(demo)}
                        onCheckedChange={(checked) => handleDemographicsChange(demo, checked as boolean)}
                      />
                      <Label htmlFor={demo} className="text-sm">{demo}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="admissionTimeline">Preferred Admission Timeline</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, admissionTimeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early-decision">Early Decision</SelectItem>
                    <SelectItem value="early-action">Early Action</SelectItem>
                    <SelectItem value="regular-decision">Regular Decision</SelectItem>
                    <SelectItem value="rolling-admission">Rolling Admission</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="constraints">Any Hard Constraints (optional)</Label>
                <Textarea
                  id="constraints"
                  value={formData.constraints}
                  onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
                  placeholder="e.g., must be in-state, no religious-affiliated schools, specific program requirements..."
                  rows={3}
                />
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What you'll get:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Top 10 U.S. university matches with detailed fit analysis</li>
                  <li>• Personalized scholarship recommendations</li>
                  <li>• Application deadlines and next steps</li>
                  <li>• Financial planning guidance</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
      </div>

      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={isLoading}
          className="bg-primary hover:bg-primary-dark text-primary-foreground"
        >
          {currentStep === totalSteps ? (
            isLoading ? "Generating Matches..." : "Generate My Matches"
          ) : (
            "Next"
          )}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
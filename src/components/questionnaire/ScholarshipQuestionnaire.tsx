import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface ScholarshipPreferences {
  citizenship: string;
  gpa: number[];
  major: string;
  degreeLevel: string;
  financialNeed: string;
  testScores: {
    sat: string;
    act: string;
    gre: string;
    gmat: string;
    toefl: string;
    ielts: string;
  };
  activities: string[];
  demographics: string[];
  awards: string;
  timeline: string;
  essayExperience: string;
}

interface ScholarshipQuestionnaireProps {
  onSubmit: (data: ScholarshipPreferences) => void;
  isLoading: boolean;
}

const ScholarshipQuestionnaire = ({ onSubmit, isLoading }: ScholarshipQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [formData, setFormData] = useState<ScholarshipPreferences>({
    citizenship: '',
    gpa: [3.5],
    major: '',
    degreeLevel: '',
    financialNeed: '',
    testScores: {
      sat: '',
      act: '',
      gre: '',
      gmat: '',
      toefl: '',
      ielts: ''
    },
    activities: [],
    demographics: [],
    awards: '',
    timeline: '',
    essayExperience: ''
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActivitiesChange = (activity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      activities: checked 
        ? [...prev.activities, activity]
        : prev.activities.filter(a => a !== activity)
    }));
  };

  const handleDemographicsChange = (demographic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      demographics: checked 
        ? [...prev.demographics, demographic]
        : prev.demographics.filter(d => d !== demographic)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Academic Background</h2>
              <p className="text-muted-foreground">Tell us about your academic profile and citizenship</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="citizenship">Country of Citizenship</Label>
                <Input
                  id="citizenship"
                  placeholder="e.g., India, China, Brazil"
                  value={formData.citizenship}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizenship: e.target.value }))}
                />
              </div>

              <div>
                <Label>Current/Expected GPA: {formData.gpa[0].toFixed(2)}</Label>
                <div className="mt-2">
                  <Slider
                    value={formData.gpa}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gpa: value }))}
                    max={4.0}
                    min={2.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>2.0</span>
                    <span>4.0</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Major/Field of Study</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, major: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business Administration</SelectItem>
                    <SelectItem value="medicine">Medicine/Pre-Med</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="molecular-science">Molecular Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="information-systems">Information Systems</SelectItem>
                    <SelectItem value="law">Pre-Law</SelectItem>
                    <SelectItem value="public-administration">Public Administration</SelectItem>
                    <SelectItem value="social-work">Social Work</SelectItem>
                    <SelectItem value="public-policy">Public Policy</SelectItem>
                    <SelectItem value="environmental-science">Environmental Science</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                    <SelectItem value="geology">Geology</SelectItem>
                    <SelectItem value="sustainability">Sustainability Studies</SelectItem>
                    <SelectItem value="agricultural-science">Agricultural Science</SelectItem>
                    <SelectItem value="film">Film & Media Studies</SelectItem>
                    <SelectItem value="fashion-design">Fashion Design</SelectItem>
                    <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                    <SelectItem value="theater">Theater & Performing Arts</SelectItem>
                    <SelectItem value="interior-design">Interior Design</SelectItem>
                    <SelectItem value="public-health">Public Health</SelectItem>
                    <SelectItem value="biochemistry">Biochemistry</SelectItem>
                    <SelectItem value="genetics">Genetics</SelectItem>
                    <SelectItem value="neuroscience">Neuroscience</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="nutrition">Nutrition Science</SelectItem>
                    <SelectItem value="kinesiology">Kinesiology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                    <SelectItem value="international-business">International Business</SelectItem>
                    <SelectItem value="supply-chain-management">Supply Chain Management</SelectItem>
                    <SelectItem value="human-resources">Human Resources Management</SelectItem>
                    <SelectItem value="liberal-arts">Liberal Arts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Degree Level</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, degreeLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate (Bachelor's)</SelectItem>
                    <SelectItem value="graduate">Graduate (Master's)</SelectItem>
                    <SelectItem value="doctoral">Doctoral (PhD)</SelectItem>
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
              <h2 className="text-2xl font-bold mb-2">Test Scores</h2>
              <p className="text-muted-foreground">Enter your standardized test scores (if taken)</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sat">SAT Score</Label>
                  <Input
                    id="sat"
                    placeholder="e.g., 1450"
                    value={formData.testScores.sat}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, sat: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="act">ACT Score</Label>
                  <Input
                    id="act"
                    placeholder="e.g., 32"
                    value={formData.testScores.act}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, act: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gre">GRE Score</Label>
                  <Input
                    id="gre"
                    placeholder="e.g., 320"
                    value={formData.testScores.gre}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, gre: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gmat">GMAT Score</Label>
                  <Input
                    id="gmat"
                    placeholder="e.g., 650"
                    value={formData.testScores.gmat}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, gmat: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toefl">TOEFL Score</Label>
                  <Input
                    id="toefl"
                    placeholder="e.g., 100"
                    value={formData.testScores.toefl}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, toefl: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ielts">IELTS Score</Label>
                  <Input
                    id="ielts"
                    placeholder="e.g., 7.5"
                    value={formData.testScores.ielts}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      testScores: { ...prev.testScores, ielts: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Leave blank if you haven't taken the test or don't want to include the score
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Activities & Leadership</h2>
              <p className="text-muted-foreground">What extracurricular activities and leadership roles have you had?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Extracurricular Activities (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Student Government', 'Academic Clubs', 'Sports/Athletics', 'Volunteer Work',
                    'Research Experience', 'Internships', 'Part-time Work', 'Art/Music/Theater',
                    'Debate/Speech', 'Cultural Organizations', 'Religious Activities', 'Community Service'
                  ].map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={formData.activities.includes(activity)}
                        onCheckedChange={(checked) => handleActivitiesChange(activity, checked as boolean)}
                      />
                      <Label htmlFor={activity} className="text-sm">{activity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="awards">Awards, Honors, and Achievements</Label>
                <Textarea
                  id="awards"
                  placeholder="List any academic awards, scholarships, competitions won, leadership positions, publications, etc."
                  value={formData.awards}
                  onChange={(e) => setFormData(prev => ({ ...prev, awards: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Financial Need & Demographics</h2>
              <p className="text-muted-foreground">Help us find scholarships that match your background and need</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Financial Need Level</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, financialNeed: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial need level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Need (Family income &lt; $30,000)</SelectItem>
                    <SelectItem value="moderate">Moderate Need (Family income $30,000-$75,000)</SelectItem>
                    <SelectItem value="low">Low Need (Family income $75,000-$150,000)</SelectItem>
                    <SelectItem value="none">No Need (Family income &gt; $150,000)</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Demographic Categories (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {[
                    'First-generation college student', 'Underrepresented minority', 'Women in STEM',
                    'LGBTQ+ community', 'Student with disabilities', 'Military family/veteran',
                    'Rural/small town background', 'Single-parent household'
                  ].map((demographic) => (
                    <div key={demographic} className="flex items-center space-x-2">
                      <Checkbox
                        id={demographic}
                        checked={formData.demographics.includes(demographic)}
                        onCheckedChange={(checked) => handleDemographicsChange(demographic, checked as boolean)}
                      />
                      <Label htmlFor={demographic} className="text-sm">{demographic}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Application Timeline</h2>
              <p className="text-muted-foreground">When do you need scholarships and how comfortable are you with essays?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Application Timeline</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need funding?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall-2024">Fall 2024 Semester</SelectItem>
                    <SelectItem value="spring-2025">Spring 2025 Semester</SelectItem>
                    <SelectItem value="fall-2025">Fall 2025 Semester</SelectItem>
                    <SelectItem value="ongoing">Ongoing applications</SelectItem>
                    <SelectItem value="planning">Just exploring options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Essay Writing Experience</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, essayExperience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="How comfortable are you with writing essays?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - I'm confident in my writing</SelectItem>
                    <SelectItem value="good">Good - I can write well with some effort</SelectItem>
                    <SelectItem value="average">Average - I need some guidance</SelectItem>
                    <SelectItem value="beginner">Beginner - I need significant help</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
        <CardTitle className="text-center">Scholarship Matching Questionnaire</CardTitle>
      </CardHeader>
      
      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {currentStep === totalSteps ? 'Find My Scholarships' : 'Next'}
            {currentStep !== totalSteps && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScholarshipQuestionnaire;
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface VisaPreferences {
  currentCountry: string;
  citizenship: string;
  visaType: string;
  university: string;
  programType: string;
  programStart: string;
  currentVisaStatus: string;
  previousVisas: string[];
  documents: string[];
  timeline: string;
  specialCircumstances: string;
}

interface VisaQuestionnaireProps {
  onSubmit: (data: VisaPreferences) => void;
  isLoading: boolean;
}

const VisaQuestionnaire = ({ onSubmit, isLoading }: VisaQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<VisaPreferences>({
    currentCountry: '',
    citizenship: '',
    visaType: '',
    university: '',
    programType: '',
    programStart: '',
    currentVisaStatus: '',
    previousVisas: [],
    documents: [],
    timeline: '',
    specialCircumstances: ''
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

  const handlePreviousVisasChange = (visa: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      previousVisas: checked 
        ? [...prev.previousVisas, visa]
        : prev.previousVisas.filter(v => v !== visa)
    }));
  };

  const handleDocumentsChange = (document: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documents: checked 
        ? [...prev.documents, document]
        : prev.documents.filter(d => d !== document)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about your current location and citizenship</p>
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
                <Label htmlFor="currentCountry">Current Country of Residence</Label>
                <Input
                  id="currentCountry"
                  placeholder="Where do you currently live?"
                  value={formData.currentCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCountry: e.target.value }))}
                />
              </div>

              <div>
                <Label>Visa Type Needed</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, visaType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f1">F-1 (Student Visa)</SelectItem>
                    <SelectItem value="j1">J-1 (Exchange Visitor)</SelectItem>
                    <SelectItem value="m1">M-1 (Vocational Student)</SelectItem>
                    <SelectItem value="b1-b2">B-1/B-2 (Tourist/Business)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Current Visa Status (if any)</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, currentVisaStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select current status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-visa">No current U.S. visa</SelectItem>
                    <SelectItem value="f1-active">F-1 (Active)</SelectItem>
                    <SelectItem value="f1-expired">F-1 (Expired)</SelectItem>
                    <SelectItem value="j1-active">J-1 (Active)</SelectItem>
                    <SelectItem value="b1-b2">B-1/B-2</SelectItem>
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
              <h2 className="text-2xl font-bold mb-2">Academic Program</h2>
              <p className="text-muted-foreground">Information about your intended studies</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  placeholder="Name of the university you'll attend"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>

              <div>
                <Label>Program Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, programType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate (Bachelor's)</SelectItem>
                    <SelectItem value="graduate">Graduate (Master's)</SelectItem>
                    <SelectItem value="doctoral">Doctoral (PhD)</SelectItem>
                    <SelectItem value="exchange">Exchange Program</SelectItem>
                    <SelectItem value="language">Language Program</SelectItem>
                    <SelectItem value="vocational">Vocational/Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Program Start Date</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, programStart: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="When does your program start?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall-2024">Fall 2024 (Aug-Sep)</SelectItem>
                    <SelectItem value="spring-2025">Spring 2025 (Jan-Feb)</SelectItem>
                    <SelectItem value="summer-2024">Summer 2024 (May-Jun)</SelectItem>
                    <SelectItem value="fall-2025">Fall 2025 (Aug-Sep)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Previous U.S. Visas (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'F-1 Student Visa', 'J-1 Exchange Visitor', 'B-1/B-2 Tourist/Business', 
                    'H-1B Work Visa', 'L-1 Intracompany Transfer', 'Never had U.S. visa'
                  ].map((visa) => (
                    <div key={visa} className="flex items-center space-x-2">
                      <Checkbox
                        id={visa}
                        checked={formData.previousVisas.includes(visa)}
                        onCheckedChange={(checked) => handlePreviousVisasChange(visa, checked as boolean)}
                      />
                      <Label htmlFor={visa} className="text-sm">{visa}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Document Preparation</h2>
              <p className="text-muted-foreground">Which documents do you currently have ready?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Documents Ready (Select all you have)</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {[
                    'Valid Passport', 'I-20 Form (from university)', 'Financial Statements/Bank Statements',
                    'SEVIS Fee Receipt', 'Academic Transcripts', 'English Proficiency Test (TOEFL/IELTS)',
                    'Standardized Test Scores (SAT/GRE/GMAT)', 'Passport Photos', 'Letter of Admission',
                    'Financial Sponsor Documents', 'Proof of Ties to Home Country'
                  ].map((document) => (
                    <div key={document} className="flex items-center space-x-2">
                      <Checkbox
                        id={document}
                        checked={formData.documents.includes(document)}
                        onCheckedChange={(checked) => handleDocumentsChange(document, checked as boolean)}
                      />
                      <Label htmlFor={document} className="text-sm">{document}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Timeline & Special Circumstances</h2>
              <p className="text-muted-foreground">When do you plan to apply and any special considerations?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Application Timeline</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you plan to apply?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately (within 2 weeks)</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="2-3-months">In 2-3 months</SelectItem>
                    <SelectItem value="6-months">In 3-6 months</SelectItem>
                    <SelectItem value="planning">Just planning ahead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="special">Special Circumstances or Concerns</Label>
                <Textarea
                  id="special"
                  placeholder="Any visa refusals, legal issues, medical conditions, or other circumstances we should know about..."
                  value={formData.specialCircumstances}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialCircumstances: e.target.value }))}
                  rows={4}
                />
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
        <CardTitle className="text-center">Visa Guidance Questionnaire</CardTitle>
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
            {currentStep === totalSteps ? 'Get My Visa Guide' : 'Next'}
            {currentStep !== totalSteps && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaQuestionnaire;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, DollarSign, FileText, Shield } from "lucide-react";

interface HealthInsuranceQuestionnaireProps {
  onComplete?: (recommendations: any) => void;
  onCancel?: () => void;
}

const HealthInsuranceQuestionnaire = ({ onComplete, onCancel }: HealthInsuranceQuestionnaireProps) => {
  const [formData, setFormData] = useState({
    expectedIncome: "",
    currentHealth: "",
    prescriptionMeds: "",
    preferredCoverage: "",
    budgetRange: "",
    state: "",
    age: "",
    studentStatus: ""
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const income = parseInt(formData.expectedIncome) || 0;
    const budget = formData.budgetRange;
    
    const recommendations = generateRecommendations(income, budget, formData);
    onComplete?.(recommendations);
  };

  const generateRecommendations = (income: number, budget: string, data: any) => {
    const plans = [];

    // Basic student plan
    if (income < 30000 || budget === "under-100") {
      plans.push({
        name: "Student Essential Plan",
        monthly: "$85-120",
        provider: "University Health Services",
        coverage: ["Basic medical care", "Emergency services", "Preventive care"],
        link: "https://marketplace.healthcare.gov"
      });
    }

    // Comprehensive plan
    if (income >= 30000 || budget === "100-200") {
      plans.push({
        name: "International Student Comprehensive",
        monthly: "$150-200",
        provider: "StudentGuard",
        coverage: ["Full medical coverage", "Prescription drugs", "Mental health"],
        link: "https://studentguard.org"
      });
    }

    // Premium plan
    if (income >= 50000 || budget === "200+") {
      plans.push({
        name: "Premium International Coverage",
        monthly: "$220-300",
        provider: "ISO Insurance",
        coverage: ["Comprehensive coverage", "Dental & Vision", "Pre-existing conditions"],
        link: "https://isoa.org"
      });
    }

    return {
      plans,
      eligibleForSubsidy: income < 25000,
      nextSteps: [
        "Compare plans on Healthcare.gov marketplace",
        "Check if your university offers student health plans",
        "Consider supplemental coverage for specific needs"
      ]
    };
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="income">Expected Annual Income (USD)</Label>
        <Input
          id="income"
          type="number"
          placeholder="e.g., 25000"
          value={formData.expectedIncome}
          onChange={(e) => handleInputChange("expectedIncome", e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          placeholder="e.g., 22"
          value={formData.age}
          onChange={(e) => handleInputChange("age", e.target.value)}
        />
      </div>

      <div>
        <Label>Student Status</Label>
        <RadioGroup value={formData.studentStatus} onValueChange={(value) => handleInputChange("studentStatus", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full-time" id="full-time" />
            <Label htmlFor="full-time">Full-time Student</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="part-time" id="part-time" />
            <Label htmlFor="part-time">Part-time Student</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="working" id="working" />
            <Label htmlFor="working">Working Student</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>State/Location</Label>
        <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ca">California</SelectItem>
            <SelectItem value="ny">New York</SelectItem>
            <SelectItem value="tx">Texas</SelectItem>
            <SelectItem value="fl">Florida</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Current Health Status</Label>
        <RadioGroup value={formData.currentHealth} onValueChange={(value) => handleInputChange("currentHealth", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="excellent" id="excellent" />
            <Label htmlFor="excellent">Excellent - No ongoing health issues</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="good" id="good" />
            <Label htmlFor="good">Good - Minor occasional issues</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fair" id="fair" />
            <Label htmlFor="fair">Fair - Some ongoing health management</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="poor" id="poor" />
            <Label htmlFor="poor">Poor - Requires regular medical care</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Prescription Medications</Label>
        <RadioGroup value={formData.prescriptionMeds} onValueChange={(value) => handleInputChange("prescriptionMeds", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">None</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="occasional" id="occasional" />
            <Label htmlFor="occasional">Occasional (as needed)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="regular" id="regular" />
            <Label htmlFor="regular">Regular medications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="chronic" id="chronic" />
            <Label htmlFor="chronic">Multiple/chronic condition medications</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Preferred Coverage Level</Label>
        <RadioGroup value={formData.preferredCoverage} onValueChange={(value) => handleInputChange("preferredCoverage", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic" id="basic" />
            <Label htmlFor="basic">Basic - Emergency and urgent care only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">Standard - Regular medical care included</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comprehensive" id="comprehensive" />
            <Label htmlFor="comprehensive">Comprehensive - Full coverage with extras</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>Monthly Budget for Health Insurance</Label>
        <RadioGroup value={formData.budgetRange} onValueChange={(value) => handleInputChange("budgetRange", value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="under-100" id="under-100" />
            <Label htmlFor="under-100">Under $100/month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="100-200" id="100-200" />
            <Label htmlFor="100-200">$100-200/month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="200+" id="200+" />
            <Label htmlFor="200+">Over $200/month</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-6 w-6 text-primary" />
          <CardTitle>Health Insurance Questionnaire</CardTitle>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
          <div className="w-24 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <div className="flex justify-between mt-8">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="ml-2">
                Cancel
              </Button>
            )}
          </div>
          
          <Button onClick={handleNext}>
            {step === totalSteps ? "Get Recommendations" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthInsuranceQuestionnaire;
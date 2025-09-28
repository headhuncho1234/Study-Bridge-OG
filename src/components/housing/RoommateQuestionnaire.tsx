import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Home, Clock, Music, Utensils, GraduationCap } from "lucide-react";

interface RoommateQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoommatePreferences {
  sleepSchedule: string;
  cleanlinessLevel: string;
  socialLevel: string;
  studyHabits: string;
  cookingFrequency: string;
  guestPolicy: string;
  interests: string[];
  budgetRange: string;
  additionalNotes: string;
}

const RoommateQuestionnaire = ({ isOpen, onClose }: RoommateQuestionnaireProps) => {
  const [preferences, setPreferences] = useState<RoommatePreferences>({
    sleepSchedule: '',
    cleanlinessLevel: '',
    socialLevel: '',
    studyHabits: '',
    cookingFrequency: '',
    guestPolicy: '',
    interests: [],
    budgetRange: '',
    additionalNotes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = () => {
    // Here you would typically save to database and find matches
    console.log('Roommate preferences:', preferences);
    
    // Show mock results for now
    alert('Great! We found 5 potential roommate matches based on your preferences. Check your dashboard for details.');
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Sleep Schedule</Label>
              <RadioGroup 
                value={preferences.sleepSchedule} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, sleepSchedule: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early-bird" id="early-bird" />
                  <Label htmlFor="early-bird">Early Bird (Sleep before 10 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Normal (10 PM - 12 AM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night-owl" id="night-owl" />
                  <Label htmlFor="night-owl">Night Owl (After 12 AM)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Cleanliness Level</Label>
              <RadioGroup 
                value={preferences.cleanlinessLevel} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, cleanlinessLevel: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-clean" id="very-clean" />
                  <Label htmlFor="very-clean">Very Clean (Daily cleaning)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately-clean" id="moderately-clean" />
                  <Label htmlFor="moderately-clean">Moderately Clean (Weekly cleaning)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relaxed" id="relaxed" />
                  <Label htmlFor="relaxed">Relaxed (As needed basis)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Social Level</Label>
              <RadioGroup 
                value={preferences.socialLevel} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, socialLevel: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-social" id="very-social" />
                  <Label htmlFor="very-social">Very Social (Love hanging out)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately-social" id="moderately-social" />
                  <Label htmlFor="moderately-social">Moderately Social (Sometimes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private (Prefer personal space)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Study Habits</Label>
              <RadioGroup 
                value={preferences.studyHabits} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, studyHabits: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quiet-studier" id="quiet-studier" />
                  <Label htmlFor="quiet-studier">Quiet Studier (Library-like silence)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible (Can adapt)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group-studier" id="group-studier" />
                  <Label htmlFor="group-studier">Group Studier (Like studying together)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Cooking Frequency</Label>
              <RadioGroup 
                value={preferences.cookingFrequency} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingFrequency: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Daily (Love cooking)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Few times a week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely" />
                  <Label htmlFor="rarely">Rarely (Prefer eating out)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Guest Policy</Label>
              <RadioGroup 
                value={preferences.guestPolicy} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, guestPolicy: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="open" id="open" />
                  <Label htmlFor="open">Open (Guests welcome anytime)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advance-notice" id="advance-notice" />
                  <Label htmlFor="advance-notice">Advance Notice (Please inform beforehand)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited" id="limited" />
                  <Label htmlFor="limited">Limited (Occasional guests only)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Interests & Hobbies</Label>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Sports & Fitness', 'Music & Arts', 'Gaming', 'Reading',
                  'Cooking', 'Travel', 'Movies & TV', 'Outdoor Activities',
                  'Technology', 'Photography', 'Dancing', 'Language Learning'
                ].map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={preferences.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={interest} className="text-sm">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Budget Range (Monthly)</Label>
              <RadioGroup 
                value={preferences.budgetRange} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, budgetRange: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500-800" id="500-800" />
                  <Label htmlFor="500-800">$500 - $800</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="800-1200" id="800-1200" />
                  <Label htmlFor="800-1200">$800 - $1,200</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1200-1800" id="1200-1800" />
                  <Label htmlFor="1200-1800">$1,200 - $1,800</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1800+" id="1800+" />
                  <Label htmlFor="1800+">$1,800+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Anything else you'd like potential roommates to know..."
                value={preferences.additionalNotes}
                onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.sleepSchedule && preferences.cleanlinessLevel;
      case 2:
        return preferences.socialLevel && preferences.studyHabits;
      case 3:
        return preferences.cookingFrequency && preferences.guestPolicy;
      case 4:
        return preferences.budgetRange;
      default:
        return false;
    }
  };

  const stepIcons = [
    <Clock className="h-5 w-5" />,
    <Users className="h-5 w-5" />,
    <Utensils className="h-5 w-5" />,
    <GraduationCap className="h-5 w-5" />
  ];

  const stepTitles = [
    'Lifestyle Basics',
    'Social Preferences',
    'Living Arrangements',
    'Interests & Budget'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Roommate Matching Questionnaire
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === currentStep 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'border-muted-foreground text-muted-foreground'
              }`}>
                {step < currentStep ? '✓' : stepIcons[step - 1]}
              </div>
              {step < 4 && <div className="w-12 h-0.5 bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{stepTitles[currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              Find Roommate Matches
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoommateQuestionnaire;
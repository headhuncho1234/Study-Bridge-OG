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

export interface HousingPreferences {
  university: string;
  budget: number[];
  housingType: string;
  location: string[];
  roommates: string;
  amenities: string[];
  transportation: string[];
  timeline: string;
  additionalRequirements: string;
}

interface HousingQuestionnaireProps {
  onSubmit: (data: HousingPreferences) => void;
  isLoading: boolean;
}

const HousingQuestionnaire = ({ onSubmit, isLoading }: HousingQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<HousingPreferences>({
    university: '',
    budget: [800],
    housingType: '',
    location: [],
    roommates: '',
    amenities: [],
    transportation: [],
    timeline: '',
    additionalRequirements: ''
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

  const handleLocationChange = (location: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      location: checked 
        ? [...prev.location, location]
        : prev.location.filter(l => l !== location)
    }));
  };

  const handleAmenitiesChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleTransportationChange = (transport: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      transportation: checked 
        ? [...prev.transportation, transport]
        : prev.transportation.filter(t => t !== transport)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Housing Basics</h2>
              <p className="text-muted-foreground">Tell us about your university and budget preferences</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="university">University/College</Label>
                <Input
                  id="university"
                  placeholder="Enter your university name"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>

              <div>
                <Label>Monthly Budget Range: ${formData.budget[0]}</Label>
                <div className="mt-2">
                  <Slider
                    value={formData.budget}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                    max={3000}
                    min={300}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>$300</span>
                    <span>$3000+</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Housing Type Preference</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, housingType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select housing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-campus">On-Campus Dormitory</SelectItem>
                    <SelectItem value="apartment">Off-Campus Apartment</SelectItem>
                    <SelectItem value="homestay">Homestay/Host Family</SelectItem>
                    <SelectItem value="shared-house">Shared House</SelectItem>
                    <SelectItem value="studio">Studio Apartment</SelectItem>
                    <SelectItem value="no-preference">No Preference</SelectItem>
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
              <h2 className="text-2xl font-bold mb-2">Location & Roommates</h2>
              <p className="text-muted-foreground">Tell us about your location and roommate preferences</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Preferred Locations (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Walking distance to campus', 'Public transport accessible', 'Near city center', 'Quiet residential area', 'Near shopping centers', 'Close to hospitals'].map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={formData.location.includes(location)}
                        onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                      />
                      <Label htmlFor={location} className="text-sm">{location}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Roommate Preference</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, roommates: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roommate preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Room (No roommates)</SelectItem>
                    <SelectItem value="one-roommate">One Roommate</SelectItem>
                    <SelectItem value="multiple-roommates">Multiple Roommates (2-4)</SelectItem>
                    <SelectItem value="international-students">Prefer International Students</SelectItem>
                    <SelectItem value="same-gender">Same Gender Only</SelectItem>
                    <SelectItem value="no-preference">No Preference</SelectItem>
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
              <h2 className="text-2xl font-bold mb-2">Amenities & Transportation</h2>
              <p className="text-muted-foreground">What amenities and transportation options are important to you?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Important Amenities (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'WiFi included', 'Laundry facilities', 'Kitchen access', 'Gym/Fitness center', 
                    'Study rooms', 'Parking space', '24/7 Security', 'Air conditioning',
                    'Furnished room', 'Utilities included'
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenitiesChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Transportation Preferences (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Walking distance', 'Bus route access', 'Subway/Metro nearby', 
                    'Bike-friendly area', 'Parking available', 'Rideshare accessible'
                  ].map((transport) => (
                    <div key={transport} className="flex items-center space-x-2">
                      <Checkbox
                        id={transport}
                        checked={formData.transportation.includes(transport)}
                        onCheckedChange={(checked) => handleTransportationChange(transport, checked as boolean)}
                      />
                      <Label htmlFor={transport} className="text-sm">{transport}</Label>
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
              <h2 className="text-2xl font-bold mb-2">Timeline & Additional Requirements</h2>
              <p className="text-muted-foreground">When do you need housing and any special requirements?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>When do you need housing?</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="1-2-months">Within 1-2 months</SelectItem>
                    <SelectItem value="3-6-months">In 3-6 months</SelectItem>
                    <SelectItem value="fall-semester">Fall Semester (Aug-Sep)</SelectItem>
                    <SelectItem value="spring-semester">Spring Semester (Jan-Feb)</SelectItem>
                    <SelectItem value="summer-semester">Summer Semester (May-Jun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additional">Additional Requirements or Special Needs</Label>
                <Textarea
                  id="additional"
                  placeholder="Any dietary restrictions, accessibility needs, pet requirements, or other special considerations..."
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalRequirements: e.target.value }))}
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
        <CardTitle className="text-center">Housing Preference Questionnaire</CardTitle>
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
            {currentStep === totalSteps ? 'Find My Housing' : 'Next'}
            {currentStep !== totalSteps && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HousingQuestionnaire;
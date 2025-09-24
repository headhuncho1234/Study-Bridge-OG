import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Phone, Heart, BookOpen, TestTube, FileText } from "lucide-react";

interface SupportQuestionnaireProps {
  onClose: () => void;
}

const SupportQuestionnaire = ({ onClose }: SupportQuestionnaireProps) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showResults, setShowResults] = useState(false);

  const supportOptions = [
    { id: 'crisis', label: 'Crisis Services', icon: <Phone className="h-5 w-5" /> },
    { id: 'treatment', label: 'Explore Treatment Options', icon: <Heart className="h-5 w-5" /> },
    { id: 'clubs', label: 'Join Wellness Clubs', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'test', label: 'Take Mental Health Test', icon: <TestTube className="h-5 w-5" /> },
    { id: 'research', label: 'Research & Reports', icon: <FileText className="h-5 w-5" /> }
  ];

  const racialGroups = [
    'Hispanic/Latino',
    'Black/African American', 
    'Asian American',
    'African (International)',
    'Middle Eastern',
    'Native American',
    'Pacific Islander',
    'Mixed/Other'
  ];

  const africanCountries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Egypt', 
    'Morocco', 'Tanzania', 'Uganda', 'Zimbabwe', 'Other'
  ];

  const clubTypes = [
    { type: 'Book Clubs', description: 'Literary discussions and mindful reading' },
    { type: 'Mental Wellness Clubs', description: 'Support groups and wellness activities' },
    { type: 'Drug Recovery Clubs', description: 'Substance abuse support and recovery' },
    { type: 'Cultural Wellness', description: 'Culture-specific mental health support' }
  ];

  const getResourcesForOption = () => {
    switch (selectedOption) {
      case 'crisis':
        return {
          title: 'Crisis Services',
          resources: [
            { name: 'National Suicide Prevention Lifeline', contact: '988', link: 'https://suicidepreventionlifeline.org' },
            { name: 'Crisis Text Line', contact: 'Text HOME to 741741', link: 'https://crisistextline.org' },
            { name: 'International Student Emergency', contact: '1-800-XXX-XXXX', link: '#' },
            { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', link: 'https://samhsa.gov' }
          ]
        };
      case 'treatment':
        return {
          title: 'Treatment Options',
          resources: [
            { name: 'Psychology Today Therapist Finder', link: 'https://psychologytoday.com/us/therapists' },
            { name: 'NIMH Treatment Locator', link: 'https://nimh.nih.gov/health/find-help' },
            { name: 'Campus Counseling Centers', link: '#' },
            { name: 'Telehealth Mental Health Services', link: 'https://betterhelp.com' },
            { name: 'International Student Health Insurance', link: 'https://www.internationalstudentinsurance.com/contact/' }
          ]
        };
      case 'test':
        return {
          title: 'Mental Health Assessment',
          resources: [
            { name: 'Clinical Partners Mental Health Test', link: 'https://clinicalpartners.co.uk/mental-health-test' },
            { name: 'PHQ-9 Depression Screening', link: 'https://patient.info/doctor/patient-health-questionnaire-phq-9' },
            { name: 'GAD-7 Anxiety Assessment', link: 'https://adaa.org/understanding-anxiety/screening-anxiety' },
            { name: 'Stress Assessment Tool', link: '#' }
          ]
        };
      case 'research':
        return {
          title: 'Research & Reports',
          resources: [
            { name: 'NIMH Mental Health Information', link: 'https://nimh.nih.gov/health/topics' },
            { name: 'International Student Mental Health Research', link: 'https://journals.sagepub.com/doi/10.1177/0011000019878510' },
            { name: 'Cultural Adaptation & Mental Health', link: 'https://psycnet.apa.org/record/2020-17890-001' },
            { name: 'Campus Mental Health Statistics', link: 'https://www.acha.org/documents/ncha/NCHA-III_FALL_2021_REFERENCE_GROUP_DATA_REPORT.pdf' }
          ]
        };
      default:
        return { title: '', resources: [] };
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  if (showResults) {
    const resourceData = getResourcesForOption();
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{resourceData.title}</CardTitle>
          </div>
          {selectedGroup && (
            <Badge variant="secondary">Customized for {selectedGroup}</Badge>
          )}
        </CardHeader>
        
        <CardContent>
          {selectedOption === 'clubs' ? (
            <Tabs defaultValue={clubTypes[0].type} className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                {clubTypes.map((club) => (
                  <TabsTrigger key={club.type} value={club.type} className="text-xs">
                    {club.type.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {clubTypes.map((club) => (
                <TabsContent key={club.type} value={club.type} className="space-y-4">
                  <div className="text-center py-4">
                    <h3 className="text-xl font-semibold mb-2">{club.type}</h3>
                    <p className="text-muted-foreground">{club.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Weekly Meetings</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Join our {selectedGroup ? `${selectedGroup}-focused` : 'diverse'} community for weekly support sessions.
                        </p>
                        <Button className="w-full">Join Group</Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Online Community</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect with peers 24/7 through our secure online platform.
                        </p>
                        <Button variant="outline" className="w-full">Access Forum</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {resourceData.resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{resource.name}</h4>
                        {resource.contact && (
                          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2">
                            {resource.contact}
                          </p>
                        )}
                      </div>
                      {resource.link && resource.link !== '#' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(resource.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">Need Immediate Help?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If you're in crisis, don't wait. Contact emergency services immediately.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive">Call 911</Button>
              <Button size="sm" variant="outline">Call 988</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Get Support Now</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Tell us what kind of support you're looking for so we can connect you with the right resources.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Support Type Selection */}
        <div>
          <h3 className="font-semibold mb-3">What are you looking for?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportOptions.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedOption === option.id ? 'ring-2 ring-primary bg-accent' : ''
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cultural Background Selection */}
        <div>
          <h3 className="font-semibold mb-3">Cultural Background (Optional)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Help us provide culturally relevant resources and support.
          </p>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select your background" />
            </SelectTrigger>
            <SelectContent>
              {racialGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Selection for African Students */}
        {selectedGroup === 'African (International)' && (
          <div>
            <h3 className="font-semibold mb-3">Country of Origin</h3>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {africanCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={!selectedOption}
        >
          Get My Resources
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupportQuestionnaire;
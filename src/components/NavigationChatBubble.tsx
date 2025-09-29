import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Home, 
  Users, 
  User, 
  Award, 
  GraduationCap, 
  MapPin, 
  Heart, 
  FileText,
  Search,
  BookOpen,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const NavigationChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const navigationSections = [
    {
      title: 'Main Pages',
      icon: Home,
      items: [
        { label: 'Home', path: '/', icon: Home, description: 'Back to homepage' },
        { label: 'Dashboard', path: '/dashboard', icon: Compass, description: 'Your personal dashboard' },
        { label: 'Community', path: '/community', icon: Users, description: 'Connect with other students' },
        { label: 'My Profile', path: '/profile', icon: User, description: 'View and edit your profile' },
      ]
    },
    {
      title: 'Features',
      icon: BookOpen,
      items: [
        { label: 'Smart Matching', path: '/features/smart-matching', icon: GraduationCap, description: 'Find your perfect university' },
        { label: 'Scholarship Database', path: '/features/scholarship-database', icon: Award, description: 'Discover funding opportunities' },
        { label: 'Housing Solutions', path: '/features/housing-solutions', icon: MapPin, description: 'Find student accommodation' },
        { label: 'Visa Guidance', path: '/features/visa-guidance', icon: FileText, description: 'Navigate visa processes' },
        { label: 'Wellness Support', path: '/features/wellness-support', icon: Heart, description: 'Mental health & wellness resources' },
        { label: 'Student Community', path: '/features/student-community', icon: Users, description: 'Connect and share experiences' },
      ]
    },
    {
      title: 'Questionnaires',
      icon: FileText,
      items: [
        { label: 'Housing Questionnaire', path: '/questionnaires/housing', icon: MapPin, description: 'Find housing that matches your needs' },
        { label: 'Scholarship Questionnaire', path: '/questionnaires/scholarship', icon: Award, description: 'Discover scholarships for you' },
        { label: 'Visa Questionnaire', path: '/questionnaires/visa', icon: FileText, description: 'Get personalized visa guidance' },
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const filteredSections = searchTerm 
    ? navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : navigationSections;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-elegant hover-scale bg-gradient-primary"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="w-80 h-96 shadow-elegant border-primary/20">
        <CardHeader className="p-4 bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              <span className="font-semibold">Quick Navigation</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <CardContent className="p-0">
            {filteredSections.map((section) => (
              <div key={section.title} className="p-4 border-b border-border/50 last:border-b-0">
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-muted/80 transition-colors"
                      onClick={() => handleNavigate(item.path)}
                    >
                      <div className="flex items-start gap-3 w-full text-left">
                        <item.icon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </ScrollArea>

        <div className="p-3 border-t bg-muted/20 rounded-b-lg">
          <p className="text-xs text-muted-foreground text-center">
            Quick access to all StudyBridge features
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NavigationChatBubble;
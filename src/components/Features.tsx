import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  Users, 
  MapPin, 
  DollarSign, 
  Heart,
  GraduationCap,
  MessageSquare
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Smart School Matching",
      description: "AI analyzes your preferences, budget, and goals to recommend the perfect universities and programs for your field of study.",
      benefits: ["Personalized recommendations", "Budget-friendly options", "Scholarship opportunities"]
    },
    {
      icon: <DollarSign className="h-8 w-8 text-secondary" />,
      title: "Scholarship Database",
      description: "Access thousands of scholarships with AI-powered matching based on your profile, nationality, and academic achievements.",
      benefits: ["Merit-based scholarships", "Need-based aid", "Country-specific funding"]
    },
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: "Visa Guidance",
      description: "Step-by-step visa application support with interview preparation and document checklists tailored to your destination country.",
      benefits: ["Interview simulation", "Document checklist", "Success tips"]
    },
    {
      icon: <MapPin className="h-8 w-8 text-success" />,
      title: "Housing Solutions",
      description: "Find safe, affordable housing options near your university with cost comparisons and student reviews.",
      benefits: ["On-campus housing", "Off-campus apartments", "Roommate matching"]
    },
    {
      icon: <Users className="h-8 w-8 text-primary-light" />,
      title: "Student Community",
      description: "Connect with fellow international students, find study groups, roommates, and get peer support throughout your journey.",
      benefits: ["Peer networking", "Study groups", "Cultural events"]
    },
    {
      icon: <Heart className="h-8 w-8 text-destructive" />,
      title: "Wellness Support",
      description: "Mental health resources, stress management tips, and connections to campus counseling services and support groups.",
      benefits: ["Counseling resources", "Stress management", "Peer support groups"]
    },
    {
      icon: <Search className="h-8 w-8 text-secondary-light" />,
      title: "Document Tracker",
      description: "Never miss a deadline with our intelligent document tracking system that monitors your application progress.",
      benefits: ["Deadline reminders", "Progress tracking", "Document templates"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-accent-light" />,
      title: "24/7 AI Assistant",
      description: "Get instant answers to your questions about applications, visas, housing, finances, and campus life anytime, anywhere.",
      benefits: ["Instant responses", "Multi-language support", "Personalized advice"]
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform addresses every challenge identified in international student research, 
            from pre-arrival planning to post-graduation success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const getFeatureLink = (title: string) => {
              switch (title) {
                case "Smart School Matching":
                  return "/features/smart-matching";
                case "Scholarship Database":
                  return "/features/scholarship-database";
                case "Visa Guidance":
                  return "/features/visa-guidance";
                case "Housing Solutions":
                  return "/features/housing-solutions";
                case "Student Community":
                  return "/features/student-community";
                case "Wellness Support":
                  return "/features/wellness-support";
                case "Document Tracker":
                  return "/features/document-tracker";
                case "24/7 AI Assistant":
                  return "/features/ai-assistant";
                default:
                  return "#";
              }
            };

            return (
              <Card 
                key={index} 
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border/50 bg-gradient-card backdrop-blur-sm cursor-pointer"
                onClick={() => window.location.href = getFeatureLink(feature.title)}
              >
                <CardContent className="p-6">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Research-Backed Solutions</h3>
            <p className="text-lg mb-6 text-white/90 max-w-3xl mx-auto">
              Our platform is built on extensive research including studies from PMC, SAGE Publications, 
              and Wiley Online Library, addressing the real challenges faced by international students.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-accent">65%</div>
                <div className="text-sm text-white/80">Report loneliness</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">43%</div>
                <div className="text-sm text-white/80">Experience anxiety</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">95%</div>
                <div className="text-sm text-white/80">Face financial strain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
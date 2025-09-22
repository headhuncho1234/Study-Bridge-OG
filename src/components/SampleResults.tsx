import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Trophy,
  Clock,
  Users
} from "lucide-react";

const SampleResults = () => {
  const sampleUniversities = [
    {
      name: "University of Toronto",
      location: "Toronto, Canada",
      program: "Master of Computer Science",
      tuition: "$47,000 CAD",
      ranking: "#1 in Canada",
      scholarshipMatch: "85%",
      deadline: "Dec 15, 2024",
      features: ["Top-tier research", "Co-op programs", "Diverse campus"]
    },
    {
      name: "Technical University Munich",
      location: "Munich, Germany",
      program: "MSc Computer Science",
      tuition: "€3,000/year",
      ranking: "#3 in Europe",
      scholarshipMatch: "92%",
      deadline: "Jan 31, 2025",
      features: ["DAAD eligible", "English taught", "Industry connections"]
    },
    {
      name: "University of Melbourne",
      location: "Melbourne, Australia",
      program: "Master of Information Technology",
      tuition: "$45,000 AUD",
      ranking: "#1 in Australia",
      scholarshipMatch: "78%",
      deadline: "Oct 31, 2024",
      features: ["Post-study work visa", "Tech hub location", "Strong alumni network"]
    }
  ];

  const scholarships = [
    {
      name: "DAAD Graduate School Scholarship",
      amount: "€1,200/month + tuition",
      eligibility: "Developing countries",
      deadline: "Oct 31, 2024",
      match: "94%"
    },
    {
      name: "Vanier Canada Graduate Scholarships",
      amount: "$50,000 CAD/year",
      eligibility: "Doctoral students",
      deadline: "Nov 3, 2024",
      match: "67%"
    },
    {
      name: "Australia Awards Scholarship",
      amount: "Full tuition + living allowance",
      eligibility: "Asia-Pacific students",
      deadline: "Apr 30, 2025",
      match: "89%"
    }
  ];

  const roadmapSteps = [
    {
      phase: "Preparation Phase",
      duration: "3-6 months before",
      tasks: [
        "Research universities and programs",
        "Prepare standardized test scores (GRE/IELTS)",
        "Gather academic transcripts and references",
        "Draft personal statement and CV"
      ],
      status: "current"
    },
    {
      phase: "Application Phase",
      duration: "6-9 months before",
      tasks: [
        "Submit university applications",
        "Apply for scholarships and funding",
        "Complete visa documentation prep",
        "Arrange financial proof documents"
      ],
      status: "upcoming"
    },
    {
      phase: "Pre-Departure",
      duration: "2-3 months before",
      tasks: [
        "Attend visa interview",
        "Secure accommodation",
        "Book flights and arrange pickup",
        "Complete health insurance and medical checks"
      ],
      status: "future"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Sample AI-Generated Results
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Here's what your personalized recommendations might look like based on our AI analysis
          </p>
        </div>

        {/* University Recommendations */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Trophy className="h-6 w-6 text-primary mr-2" />
            Top University Matches
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sampleUniversities.map((uni, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{uni.name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {uni.location}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      {uni.scholarshipMatch} match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-primary">{uni.program}</p>
                      <p className="text-sm text-muted-foreground">{uni.ranking}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                        {uni.tuition}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {uni.deadline}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {uni.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-accent mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(uni.name + " university official website")}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scholarship Recommendations */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <DollarSign className="h-6 w-6 text-secondary mr-2" />
            Scholarship Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scholarships.map((scholarship, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{scholarship.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {scholarship.match} match
                      </Badge>
                    </div>
                    
                    <div className="text-lg font-bold text-primary">
                      {scholarship.amount}
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {scholarship.eligibility}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Deadline: {scholarship.deadline}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(scholarship.name + " scholarship application")}`, '_blank')}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Personalized Roadmap */}
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="h-6 w-6 text-accent mr-2" />
            Your Personalized Roadmap
          </h3>
          <div className="space-y-6">
            {roadmapSteps.map((step, index) => (
              <Card key={index} className={`shadow-card ${step.status === 'current' ? 'border-primary' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.status === 'current' 
                        ? 'bg-primary text-primary-foreground' 
                        : step.status === 'upcoming'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{step.phase}</h4>
                        <Badge variant={step.status === 'current' ? 'default' : 'secondary'}>
                          {step.duration}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleResults;
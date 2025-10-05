import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Globe, Clock, Zap, Brain, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";

const AIAssistant = () => {
  const assistantFeatures = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "On the Go?",
      description: "Get help anytime, anywhere - our AI never sleeps",
      examples: ["Late night study questions", "Weekend deadline reminders", "Holiday application help"]
    },
    {
      icon: <Globe className="h-8 w-8 text-secondary" />,
      title: "Multi-Language Support",
      description: "Communicate in your preferred language",
      examples: ["Spanish responses", "Mandarin explanations", "Hindi translations"]
    },
    {
      icon: <Brain className="h-8 w-8 text-accent" />,
      title: "Personalized Advice",
      description: "Tailored guidance based on your profile and goals",
      examples: ["Major-specific advice", "Country-based visa info", "Budget recommendations"]
    },
    {
      icon: <Zap className="h-8 w-8 text-success" />,
      title: "Instant Responses",
      description: "Get immediate answers to complex questions",
      examples: ["Application deadlines", "Visa requirements", "Scholarship eligibility"]
    }
  ];

  const topicAreas = [
    {
      category: "University Applications",
      topics: ["Application deadlines", "Required documents", "Personal statements", "Letters of recommendation"],
      queries: 1250
    },
    {
      category: "Visa & Immigration",
      topics: ["F-1 visa process", "Interview preparation", "Document requirements", "Status changes"],
      queries: 980
    },
    {
      category: "Financial Planning",
      topics: ["Tuition costs", "Scholarship opportunities", "Living expenses", "Part-time work"],
      queries: 850
    },
    {
      category: "Campus Life",
      topics: ["Housing options", "Meal plans", "Student activities", "Academic resources"],
      queries: 720
    },
    {
      category: "Career Guidance",
      topics: ["Internship opportunities", "OPT applications", "Job search strategies", "Resume building"],
      queries: 650
    },
    {
      category: "Cultural Adaptation",
      topics: ["American customs", "Communication styles", "Social norms", "Homesickness support"],
      queries: 580
    }
  ];

  const sampleQuestions = [
    {
      question: "What documents do I need for my F-1 visa interview?",
      category: "Visa",
      response: "I'll help you prepare a complete checklist including I-20, passport, financial documents, and interview tips specific to your country."
    },
    {
      question: "How can I find scholarships for computer science students?",
      category: "Financial",
      response: "Let me search our database for CS-specific scholarships based on your academic profile, nationality, and financial need."
    },
    {
      question: "What's the difference between on-campus and off-campus housing?",
      category: "Housing",
      response: "I'll compare costs, benefits, and drawbacks of each option based on your university and budget preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              24/7 AI Assistant
            </h1>
            <p className="text-muted-foreground">
              Your personal guide for studying in the United States
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <MessageSquare className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Intelligent Study Abroad Companion</h2>
                <p className="text-white/90">
                  Get instant, personalized answers to all your questions about studying in the U.S. 
                  Our AI assistant is trained on the latest immigration policies, university requirements, and student experiences.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">1M+</div>
                <div className="text-sm text-white/80">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">15+</div>
                <div className="text-sm text-white/80">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">95%</div>
                <div className="text-sm text-white/80">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">24/7</div>
                <div className="text-sm text-white/80">Always Available</div>
              </div>
            </div>
            
            <Link to="/">
              <Button variant="secondary" size="lg" className="mt-4">
                Chat with Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Assistant Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What Distinguishes Us From the Rest</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {assistantFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Examples:</p>
                    {feature.examples.map((example, idx) => (
                      <p key={idx} className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-3 w-3 text-yellow-500" />
                        {example}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Topic Areas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Ask About</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicAreas.map((area, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.category}</CardTitle>
                    <Badge variant="secondary">{area.queries}+ queries</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {area.topics.map((topic, idx) => (
                      <p key={idx} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {topic}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sample Conversations */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Sample Conversations</h2>
          <div className="space-y-6">
            {sampleQuestions.map((sample, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{sample.category}</Badge>
                      </div>
                      <p className="font-medium mb-3">{sample.question}</p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">{sample.response}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl">How Our AI Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Brain className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">1. Understands Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your question and considers your profile, preferences, and current stage in the application process.
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">2. Searches Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">
                    Instantly searches through thousands of university requirements, visa policies, and student experiences.
                  </p>
                </div>
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">3. Provides Personalized Answer</h3>
                  <p className="text-sm text-muted-foreground">
                    Delivers a comprehensive, personalized response with actionable next steps and relevant resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-950/20 dark:to-blue-950/20">
          <CardContent className="p-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-cyan-600" />
            <h3 className="text-xl font-bold mb-4">Ready to Get Instant Answers?</h3>
            <p className="text-muted-foreground mb-6">
              Don't wait for office hours or email responses. Get immediate, accurate answers to all your 
              study abroad questions from our intelligent AI assistant.
            </p>
            <Button size="lg" className="mr-4">
              Start Chatting
            </Button>
            <Button variant="outline" size="lg">
              See More Examples
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
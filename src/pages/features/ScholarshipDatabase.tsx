import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Award, Search, Users } from "lucide-react";
import ScholarshipFilters, { ScholarshipFilters as FilterType } from "@/components/scholarships/ScholarshipFilters";
import Navbar from "@/components/Navbar";

const ScholarshipDatabase = () => {
  const [filters, setFilters] = useState<FilterType>({
    searchQuery: "",
    fieldOfStudy: "",
    country: "",
    amountRange: [0, 50000],
    deadline: "",
    gpaRequirement: "",
    scholarshipType: ""
  });
  const scholarshipTypes = [
    {
      title: "Merit-Based Scholarships",
      description: "Rewards for academic excellence, test scores, and achievements",
      examples: ["National Merit Scholar", "Dean's List Recognition", "Honor Society Awards"],
      range: "$2,000 - $50,000"
    },
    {
      title: "Need-Based Aid",
      description: "Financial assistance based on family income and circumstances",
      examples: ["Pell Grants", "State Need Grants", "Institutional Aid"],
      range: "$1,000 - $30,000"
    },
    {
      title: "Country-Specific Funding",
      description: "Scholarships for students from specific countries or regions",
      examples: ["Fulbright Program", "Embassy Scholarships", "Cultural Exchange Grants"],
      range: "$5,000 - $75,000"
    },
    {
      title: "Field-Specific Awards",
      description: "Scholarships for students in particular majors or career paths",
      examples: ["STEM Excellence Awards", "Arts & Humanities Grants", "Business Leadership Scholarships"],
      range: "$3,000 - $40,000"
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
              Scholarship Database
            </h1>
            <p className="text-muted-foreground">
              Discover thousands of funding opportunities matched to your profile
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-secondary to-secondary/80 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Find Your Perfect Scholarship Match</h2>
                <p className="text-white/90">
                  Access our comprehensive database of scholarships, grants, and financial aid opportunities 
                  specifically curated for international students studying in the United States.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">10,000+</div>
                <div className="text-sm text-white/80">Scholarships Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">$2.5B</div>
                <div className="text-sm text-white/80">Total Awards Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">85%</div>
                <div className="text-sm text-white/80">Success Rate</div>
              </div>
            </div>
            
            <Link to="/questionnaires/scholarships">
              <Button variant="link" size="lg" className="mt-4">
                Find My Scholarships
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-1">
            <ScholarshipFilters onFiltersChange={setFilters} />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Available Scholarships</h2>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">Showing scholarships based on your criteria</p>
                <Button variant="outline" size="sm">
                  Save Search
                </Button>
              </div>
            </div>

            {/* Scholarship Types */}
            <div className="space-y-4">
              {scholarshipTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{type.range}</Badge>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Examples:</p>
                      {type.examples.map((example, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          {example}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How Our AI Matching Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-primary mb-2" />
                <CardTitle>1. Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes your academic background, nationality, field of study, 
                  financial need, and achievements to create a comprehensive profile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-secondary mb-2" />
                <CardTitle>2. Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced algorithms match your profile against thousands of scholarships, 
                  considering eligibility requirements and award amounts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-accent mb-2" />
                <CardTitle>3. Prioritized Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive ranked scholarship recommendations with application deadlines, 
                  requirements, and direct links to apply.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Database Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Updated Daily</h3>
                <p className="text-sm text-muted-foreground">Fresh opportunities added every day</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Search className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Advanced Filters</h3>
                <p className="text-sm text-muted-foreground">Filter by amount, deadline, field, and more</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Award Tracking</h3>
                <p className="text-sm text-muted-foreground">Track application status and deadlines</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Community Tips</h3>
                <p className="text-sm text-muted-foreground">Learn from successful applicants</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">Start Finding Scholarships Today</h3>
            <p className="text-muted-foreground mb-6">
              Don't let financial barriers stop your educational dreams. Our AI will help you find 
              scholarships you qualify for and guide you through the application process.
            </p>
            <Link to="/questionnaires/scholarships">
              <Button size="lg" className="mr-4">
                Find My Scholarships
              </Button>
            </Link>
            <Link to="/community?channel=scholarships">
              <Button variant="outline" size="lg">
                Success Stories
              </Button>
            </Link>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDatabase;
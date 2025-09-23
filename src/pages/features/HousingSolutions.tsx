import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Home, Users, DollarSign, Star, Shield } from "lucide-react";

const HousingSolutions = () => {
  const housingTypes = [
    {
      type: "On-Campus Housing",
      description: "University dormitories and residence halls",
      priceRange: "$8,000 - $15,000/year",
      pros: ["Close to classes", "Meal plans included", "Built-in community", "24/7 security"],
      cons: ["Limited privacy", "Shared facilities", "Housing lottery system"]
    },
    {
      type: "Off-Campus Apartments",
      description: "Private apartments and shared housing near campus",
      priceRange: "$600 - $2,000/month",
      pros: ["More independence", "Choice of roommates", "Kitchen facilities", "Pets allowed"],
      cons: ["Commute required", "Utility costs", "Lease commitments"]
    },
    {
      type: "Homestay Programs",
      description: "Living with local families for cultural immersion",
      priceRange: "$800 - $1,500/month",
      pros: ["Cultural experience", "Language practice", "Support system", "Meals included"],
      cons: ["Less independence", "House rules", "Limited guest privileges"]
    }
  ];

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Location-Based Search",
      description: "Find housing within walking distance or public transport routes to your university"
    },
    {
      icon: <DollarSign className="h-6 w-6 text-secondary" />,
      title: "Budget Optimization",
      description: "Compare costs including rent, utilities, and transportation to find the best value"
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: "Roommate Matching",
      description: "Connect with compatible roommates based on lifestyle, study habits, and interests"
    },
    {
      icon: <Star className="h-6 w-6 text-success" />,
      title: "Verified Reviews",
      description: "Read authentic reviews from international students about housing options"
    },
    {
      icon: <Shield className="h-6 w-6 text-warning" />,
      title: "Safety Assessment",
      description: "Get safety ratings and crime statistics for neighborhoods and properties"
    },
    {
      icon: <Home className="h-6 w-6 text-info" />,
      title: "Virtual Tours",
      description: "Take 360° virtual tours of properties before making your decision"
    }
  ];

  return (
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
              Housing Solutions
            </h1>
            <p className="text-muted-foreground">
              Find safe, affordable housing near your university
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-success to-success/80 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Home className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Home Away From Home</h2>
                <p className="text-white/90">
                  Finding the right housing is crucial for your success as an international student. 
                  Our platform helps you discover safe, affordable options with detailed reviews and comparisons.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">50,000+</div>
                <div className="text-sm text-white/80">Housing Options</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">2,500+</div>
                <div className="text-sm text-white/80">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">95%</div>
                <div className="text-sm text-white/80">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
            
            <Link to="/questionnaires/housing">
              <Button variant="secondary" size="lg" className="mt-4">
                Start Housing Search
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Housing Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Housing Options for International Students</h2>
          <div className="space-y-6">
            {housingTypes.map((housing, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{housing.type}</CardTitle>
                    <Badge variant="secondary">{housing.priceRange}</Badge>
                  </div>
                  <p className="text-muted-foreground">{housing.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-green-600">Pros</h4>
                      <div className="space-y-1">
                        {housing.pros.map((pro, idx) => (
                          <p key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {pro}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-orange-600">Considerations</h4>
                      <div className="space-y-1">
                        {housing.cons.map((con, idx) => (
                          <p key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                            {con}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How We Help You Find the Perfect Home</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Roommate Matching */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Smart Roommate Matching</CardTitle>
              <p className="text-center text-muted-foreground">
                Find compatible roommates who share your lifestyle and academic goals
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Matching Criteria</h3>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      Academic program and study habits
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      Lifestyle preferences and cleanliness
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      Social activities and interests
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      Budget range and shared expenses
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      Language preferences and cultural background
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Safety Features</h3>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-600" />
                      Verified student profiles
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-600" />
                      University email verification
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-600" />
                      Background check assistance
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-600" />
                      Secure messaging platform
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-600" />
                      24/7 support for conflicts
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-success/10 to-primary/10">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-4">Ready to Find Your Perfect Home?</h3>
            <p className="text-muted-foreground mb-6">
              Start your housing search today and join thousands of international students 
              who have found their ideal accommodation through our platform.
            </p>
            <Link to="/questionnaires/housing">
              <Button size="lg" className="mr-4">
                Start Housing Search
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg">
                Housing Reviews
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HousingSolutions;
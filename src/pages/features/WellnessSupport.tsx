import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Phone, MessageCircle, Users, Brain, Smile, Trophy, Gamepad2 } from "lucide-react";
import FocusQuest from "@/components/wellness/FocusQuest";
import SupportQuestionnaire from "@/components/wellness/SupportQuestionnaire";
import WellnessRewards from "@/components/wellness/WellnessRewards";
import WellnessArcade from "@/components/wellness/WellnessArcade";
import { useWellnessData } from "@/hooks/useWellnessData";

const WellnessSupport = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { wellnessData, addCoins, updateStreak, purchaseItem, updateArcadeStreak, addConsecutiveGame } = useWellnessData();

  const supportResources = [
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "24/7 Crisis Support",
      description: "Immediate help when you need it most",
      details: ["Crisis hotlines", "Emergency contacts", "Urgent care locations", "Mental health first aid"]
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-secondary" />,
      title: "AI Wellness Coach",
      description: "Personalized mental health guidance and check-ins",
      details: ["Daily mood tracking", "Stress management tips", "Mindfulness exercises", "Goal setting"]
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: "Peer Support Groups",
      description: "Connect with students facing similar challenges",
      details: ["Cultural adjustment groups", "Academic stress support", "Social anxiety groups", "Homesickness support"]
    },
    {
      icon: <Brain className="h-8 w-8 text-success" />,
      title: "Campus Counseling",
      description: "Professional counseling services at your university",
      details: ["Individual therapy", "Group sessions", "Psychiatric services", "Crisis intervention"]
    },
    {
      icon: <Heart className="h-8 w-8 text-blue-500" />,
      title: "Health Insurance Support",
      description: "International student health insurance guidance and resources",
      details: ["Insurance plan comparisons", "Coverage explanations", "Claims assistance", "Emergency medical support"]
    }
  ];

  const wellnessTips = [
    "Maintain a regular sleep schedule despite time zone changes",
    "Stay connected with family and friends back home",
    "Join clubs and activities to build a support network",
    "Practice mindfulness and stress-reduction techniques",
    "Don't hesitate to seek help when you need it",
    "Celebrate small victories and cultural milestones"
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
              Wellness Support
            </h1>
            <p className="text-muted-foreground">
              Mental health resources and support for your wellbeing
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-pink-500 to-rose-400 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Heart className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Mental Health Matters</h2>
                <p className="text-white/90">
                  Studying abroad can be challenging. Our comprehensive wellness support system provides 
                  resources, tools, and connections to help you thrive mentally and emotionally.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">24/7</div>
                <div className="text-sm text-white/80">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">15+</div>
                <div className="text-sm text-white/80">Languages Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">100%</div>
                <div className="text-sm text-white/80">Confidential</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="mt-4"
              onClick={() => setShowQuestionnaire(true)}
            >
              Get Support Now
            </Button>
          </CardContent>
        </Card>

        {/* Support Questionnaire Modal */}
        {showQuestionnaire && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-h-[90vh] overflow-y-auto">
              <SupportQuestionnaire onClose={() => setShowQuestionnaire(false)} />
            </div>
          </div>
        )}

        {/* Wellness Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="focus-quest" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Focus Quest
              </TabsTrigger>
              <TabsTrigger value="arcade" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Arcade
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Rewards
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Support Resources */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Comprehensive Support Resources</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {supportResources.map((resource, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {resource.icon}
                          <div>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{resource.description}</p>
                        <div className="space-y-2">
                          {resource.details.map((detail, idx) => (
                            <p key={idx} className="text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {detail}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Common Challenges */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Common Challenges We Address</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Smile className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Homesickness</h3>
                      <p className="text-sm text-muted-foreground">
                        Missing home is normal. We provide coping strategies and connections to your culture.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Brain className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Academic Stress</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage the pressure of studying in a new educational system with peer support.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Users className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Social Isolation</h3>
                      <p className="text-sm text-muted-foreground">
                        Build meaningful connections and find your community in a new country.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <MessageCircle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Language Barriers</h3>
                      <p className="text-sm text-muted-foreground">
                        Overcome communication challenges that affect your confidence and relationships.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Cultural Adjustment</h3>
                      <p className="text-sm text-muted-foreground">
                        Navigate identity and belonging while adapting to American culture.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Phone className="h-8 w-8 text-teal-500 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Financial Anxiety</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage stress about tuition, living costs, and financial independence.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Wellness Tips */}
              <div>
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl">Daily Wellness Tips</CardTitle>
                    <p className="text-center text-muted-foreground">
                      Simple practices to maintain your mental health and wellbeing
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {wellnessTips.map((tip, index) => (
                        <p key={index} className="text-sm flex items-start gap-2">
                          <Heart className="h-3 w-3 text-pink-500 mt-1 flex-shrink-0" />
                          {tip}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Resources */}
              <div>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Emergency Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Crisis Hotlines</h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                          <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                          <p><strong>International Student Emergency:</strong> 1-800-XXX-XXXX</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">When to Seek Help</h3>
                        <div className="space-y-1 text-sm">
                          <p>• Thoughts of self-harm or suicide</p>
                          <p>• Persistent feelings of hopelessness</p>
                          <p>• Inability to function in daily activities</p>
                          <p>• Substance abuse concerns</p>
                          <p>• Severe anxiety or panic attacks</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <Card className="text-center bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950/20 dark:to-purple-950/20">
                <CardContent className="p-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-pink-500" />
                  <h3 className="text-xl font-bold mb-4">You Don't Have to Face This Alone</h3>
                  <p className="text-muted-foreground mb-6">
                    Remember, seeking help is a sign of strength, not weakness. Our community is here to support 
                    you every step of the way on your educational journey.
                  </p>
                  <Button 
                    size="lg" 
                    className="mr-4"
                    onClick={() => setShowQuestionnaire(true)}
                  >
                    Connect with Support
                  </Button>
                  <Link to="/community">
                    <Button variant="outline" size="lg">
                      Join Peer Groups
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus-quest" className="flex justify-center">
              <FocusQuest 
                onCoinsEarned={addCoins}
                onStreakUpdate={updateStreak}
              />
            </TabsContent>

            <TabsContent value="arcade">
              <WellnessArcade />
            </TabsContent>

            <TabsContent value="rewards">
              <WellnessRewards 
                coins={wellnessData.coins}
                onPurchase={purchaseItem}
                ownedItems={wellnessData.ownedItems}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WellnessSupport;
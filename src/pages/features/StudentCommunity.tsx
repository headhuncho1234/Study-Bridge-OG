import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MessageSquare, Globe, Calendar, BookOpen, Coffee } from "lucide-react";

const StudentCommunity = () => {
  const communityFeatures = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Global Network",
      description: "Connect with 50,000+ international students from 150+ countries",
      stats: "50,000+ members"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-secondary" />,
      title: "Discussion Forums",
      description: "Join topic-specific discussions about academics, housing, and life in the U.S.",
      stats: "1,000+ daily posts"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-accent" />,
      title: "Study Groups",
      description: "Form study groups with peers in your program or university",
      stats: "500+ active groups"
    },
    {
      icon: <Calendar className="h-8 w-8 text-success" />,
      title: "Events & Meetups",
      description: "Attend virtual and in-person events in your city",
      stats: "200+ monthly events"
    }
  ];

  const popularTopics = [
    { name: "Visa & Immigration", count: 1250, color: "bg-primary" },
    { name: "Housing & Roommates", count: 980, color: "bg-secondary" },
    { name: "Academic Help", count: 850, color: "bg-accent" },
    { name: "Job Search & Internships", count: 720, color: "bg-success" },
    { name: "Cultural Adaptation", count: 650, color: "bg-warning" },
    { name: "Financial Tips", count: 580, color: "bg-info" }
  ];

  const recentPosts = [
    {
      title: "Tips for F-1 visa interview - got approved!",
      author: "Maria_Chen",
      replies: 23,
      timeAgo: "2 hours ago",
      tags: ["Visa", "Success Story"]
    },
    {
      title: "Looking for roommate near NYU - Spring 2024",
      author: "Ahmed_K",
      replies: 15,
      timeAgo: "4 hours ago",
      tags: ["Housing", "NYU", "Roommate"]
    },
    {
      title: "Best resources for TOEFL preparation?",
      author: "Sofia_Rodriguez",
      replies: 31,
      timeAgo: "6 hours ago",
      tags: ["TOEFL", "Test Prep", "English"]
    },
    {
      title: "Internship opportunities for CS majors",
      author: "Raj_Patel",
      replies: 28,
      timeAgo: "8 hours ago",
      tags: ["Internships", "Computer Science", "Career"]
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
              Student Community
            </h1>
            <p className="text-muted-foreground">
              Connect, learn, and grow with fellow international students
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Users className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold mb-2">You're Not Alone in This Journey</h2>
                <p className="text-white/90">
                  Join the largest community of international students. Share experiences, get advice, 
                  find study partners, and build lifelong friendships with peers who understand your journey.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">50,000+</div>
                <div className="text-sm text-white/80">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">150+</div>
                <div className="text-sm text-white/80">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">2,500+</div>
                <div className="text-sm text-white/80">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-white/80">Community Support</div>
              </div>
            </div>
            
            <Link to="/community">
              <Button variant="secondary" size="lg" className="mt-4">
                Join the Community
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Community Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Community Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {communityFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="secondary">{feature.stats}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Popular Discussion Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground">{topic.count} discussions</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${topic.color}`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Recent Community Posts</h2>
          <div className="space-y-4">
            {recentPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>by {post.author}</span>
                        <span>{post.replies} replies</span>
                        <span>{post.timeAgo}</span>
                      </div>
                      <div className="flex gap-2">
                        {post.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Study Groups & Events */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-accent/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join or create study groups with peers in your program. Share resources, 
                  collaborate on projects, and succeed together.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    Program-specific groups
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    Virtual and in-person sessions
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    Shared resources and notes
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Find Study Groups
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success/10 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events & Meetups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Attend networking events, cultural celebrations, career workshops, 
                  and social meetups in your city.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    Career & networking events
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    Cultural celebrations
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    Local city meetups
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4">Ready to Connect?</h3>
            <p className="text-muted-foreground mb-6">
              Join our vibrant community of international students. Share your experiences, 
              get support, and build lasting friendships with people who understand your journey.
            </p>
            <Link to="/community">
              <Button size="lg" className="mr-4">
                Join Community Now
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Browse Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentCommunity;
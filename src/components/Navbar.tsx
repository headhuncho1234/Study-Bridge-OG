import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, User, LogOut, BookOpen, GraduationCap, Plane, Home as HomeIcon, Users, Heart, FileCheck, Bot, Globe, MessageCircle, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Smart Matching",
    href: "/features/smart-matching",
    description: "AI-powered school recommendations",
    icon: GraduationCap,
  },
  {
    title: "Scholarship Database",
    href: "/features/scholarship-database", 
    description: "Find funding opportunities",
    icon: BookOpen,
  },
  {
    title: "Visa Guidance",
    href: "/features/visa-guidance",
    description: "Step-by-step visa help",
    icon: Plane,
  },
  {
    title: "Housing Solutions",
    href: "/features/housing-solutions",
    description: "Find your perfect home",
    icon: HomeIcon,
  },
  {
    title: "Student Community",
    href: "/features/student-community",
    description: "Connect with peers",
    icon: Users,
  },
  {
    title: "Wellness Support", 
    href: "/features/wellness-support",
    description: "Mental health resources",
    icon: Heart,
  },
  {
    title: "Document Tracker",
    href: "/features/document-tracker",
    description: "Track application progress",
    icon: FileCheck,
  },
  {
    title: "AI Assistant",
    href: "/features/ai-assistant",
    description: "24/7 personalized help",
    icon: Bot,
  },
];

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">SB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudyBridge
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {features.map((feature) => (
                        <NavigationMenuLink key={feature.href} asChild>
                          <Link
                            to={feature.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <feature.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">{feature.title}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Link to="/community" className="text-muted-foreground hover:text-foreground transition-smooth">
              Community
            </Link>
            <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-smooth">
              Profile
            </Link>
            <Link to="/profile/saved" className={`text-muted-foreground hover:text-foreground transition-smooth ${location.pathname === '/profile/saved' ? 'text-foreground font-medium' : ''}`}>
              My Results
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm hover:text-primary transition-smooth">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {(profile?.display_name || profile?.username || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{profile?.display_name || profile?.username || user.email?.split('@')[0]}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-foreground hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-card transition-smooth"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 bg-white/95 backdrop-blur-sm">
            <div className="py-4 space-y-2">
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  to={feature.href}
                  className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <feature.icon className="h-4 w-4" />
                  <span>{feature.title}</span>
                </Link>
              ))}
              <Link
                to="/community"
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Community</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/profile/saved"
                className={`flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors ${location.pathname === '/profile/saved' ? 'bg-muted/50 text-primary' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>My Results</span>
              </Link>
              <div className="px-4 pt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 text-sm">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {(profile?.display_name || profile?.username || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>Welcome, {profile?.display_name || profile?.username || user.email?.split('@')[0]}</span>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
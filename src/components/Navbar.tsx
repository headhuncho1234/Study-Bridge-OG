import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, MessageCircle, Users, GraduationCap, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Features", href: "#features", icon: Globe },
    { name: "AI Assistant", href: "#chatbot", icon: MessageCircle },
    { name: "Get Started", href: "#intake", icon: GraduationCap },
    { name: "Community", href: "/community", icon: Users },
    { name: "Saved Results", href: "/profile/saved", icon: Users }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudyBridge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              (item.name === "Community" || item.name === "Saved Results") ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              )
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user.email?.split('@')[0]}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut}
                  className="text-foreground hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-card transition-smooth"
                onClick={() => setIsAuthOpen(true)}
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
              {navItems.map((item) => (
                (item.name === "Community" || item.name === "Saved Results") ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </a>
                )
              ))}
              <div className="px-4 pt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>Welcome, {user.email?.split('@')[0]}</span>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
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
                      setIsAuthOpen(true);
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
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
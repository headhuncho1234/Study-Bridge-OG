import { Button } from "@/components/ui/button";
import { MessageCircle, Globe, Users, GraduationCap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Your Journey to
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Global Education
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Navigate every step of your international student journey with AI-powered guidance.
            From application to graduation, we're here to make your dreams achievable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-elegant text-lg px-8 py-6 rounded-xl font-semibold transition-smooth"
              onClick={() => document.getElementById('intake')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-white/90 shadow-elegant text-lg px-8 py-6 rounded-xl font-semibold transition-smooth"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Globe className="mr-2 h-5 w-5" />
              Explore Features
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20">
              <GraduationCap className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-white font-semibold text-lg mb-2">Smart School Matching</h3>
              <p className="text-white/80 text-sm">AI-powered recommendations based on your goals, budget, and preferences</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20">
              <Users className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-white font-semibold text-lg mb-2">Student Community</h3>
              <p className="text-white/80 text-sm">Connect with peers, find roommates, and get support from experienced students</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20">
              <MessageCircle className="h-12 w-12 text-accent mb-4 mx-auto" />
              <h3 className="text-white font-semibold text-lg mb-2">24/7 AI Assistant</h3>
              <p className="text-white/80 text-sm">Get instant answers about visas, housing, finances, and campus life</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ChatBot from "@/components/ChatBot";
import StudentIntake from "@/components/StudentIntake";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        
        <div id="features">
          <Features />
        </div>
        
        <div id="chatbot">
          <ChatBot />
        </div>
        
        <div id="intake">
          <StudentIntake />
        </div>
      </main>
      
      <footer className="bg-muted/30 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SB</span>
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudyBridge
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering international students with AI-driven guidance for their educational journey
          </p>
          <p className="text-sm text-muted-foreground">
            Built with research-backed insights • Powered by GenAI • Made for students worldwide
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import StudentIntake from "@/components/StudentIntake";
import EnhancedResultsDisplay from "@/components/questionnaire/EnhancedResultsDisplay";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        
        <div id="features">
          <Features />
        </div>
        
        <div id="intake">
          <StudentIntake />
        </div>

        {/* Enhanced Questionnaire Results */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <EnhancedResultsDisplay />
          </div>
        </section>

        {/* Contact & Support Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Not finding what you're looking for?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team is here to help you every step of the way
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-background rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">📞 Call Us</h3>
                <p className="text-2xl font-bold text-primary">1-800-555-8004</p>
                <p className="text-sm text-muted-foreground">Available 24/7 for urgent support</p>
              </div>
              <div className="p-6 bg-background rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">📧 Email Us</h3>
                <p className="text-lg font-semibold text-primary">info@intlstudybridge.org</p>
                <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Student Bridge App Promotion */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">📱 On the go?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Download the Global Student Bridge app on iOS & Android or message us on WhatsApp for instant support.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Download on iOS
              </button>
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Get it on Android
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Message on WhatsApp
              </button>
            </div>
          </div>
        </section>
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

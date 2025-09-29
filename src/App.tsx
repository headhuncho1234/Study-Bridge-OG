import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatAssistant from "./components/ChatAssistant";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import SavedResults from "./pages/SavedResults";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SmartMatching from "./pages/features/SmartMatching";
import ScholarshipDatabase from "./pages/features/ScholarshipDatabase";
import VisaGuidance from "./pages/features/VisaGuidance";
import HousingSolutions from "./pages/features/HousingSolutions";
import StudentCommunity from "./pages/features/StudentCommunity";  
import WellnessSupport from "./pages/features/WellnessSupport";
import DocumentTracker from "./pages/features/DocumentTracker";
import AIAssistant from "./pages/features/AIAssistant";
import HousingQuestionnairePage from "./pages/questionnaires/HousingQuestionnairePage";
import VisaQuestionnairePage from "./pages/questionnaires/VisaQuestionnairePage";
import ScholarshipQuestionnairePage from "./pages/questionnaires/ScholarshipQuestionnairePage";
import Scoreboard from "./pages/Scoreboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/saved" element={<SavedResults />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features/smart-matching" element={<SmartMatching />} />
          <Route path="/features/scholarship-database" element={<ScholarshipDatabase />} />
          <Route path="/features/visa-guidance" element={<VisaGuidance />} />
          <Route path="/features/housing-solutions" element={<HousingSolutions />} />
          <Route path="/features/student-community" element={<StudentCommunity />} />
          <Route path="/features/wellness-support" element={<WellnessSupport />} />
          <Route path="/features/document-tracker" element={<DocumentTracker />} />
          <Route path="/features/ai-assistant" element={<AIAssistant />} />
          <Route path="/questionnaires/housing" element={<HousingQuestionnairePage />} />
          <Route path="/questionnaires/visa" element={<VisaQuestionnairePage />} />
          <Route path="/questionnaires/scholarships" element={<ScholarshipQuestionnairePage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatAssistant />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

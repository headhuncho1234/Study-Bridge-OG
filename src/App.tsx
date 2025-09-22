import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Community from "./pages/Community";
import SavedResults from "./pages/SavedResults";
import NotFound from "./pages/NotFound";
import SmartMatching from "./pages/features/SmartMatching";
import ScholarshipDatabase from "./pages/features/ScholarshipDatabase";
import VisaGuidance from "./pages/features/VisaGuidance";
import HousingSolutions from "./pages/features/HousingSolutions";
import StudentCommunity from "./pages/features/StudentCommunity";  
import WellnessSupport from "./pages/features/WellnessSupport";
import DocumentTracker from "./pages/features/DocumentTracker";
import AIAssistant from "./pages/features/AIAssistant";

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
          <Route path="/profile/saved" element={<SavedResults />} />
          <Route path="/features/smart-matching" element={<SmartMatching />} />
          <Route path="/features/scholarship-database" element={<ScholarshipDatabase />} />
          <Route path="/features/visa-guidance" element={<VisaGuidance />} />
          <Route path="/features/housing-solutions" element={<HousingSolutions />} />
          <Route path="/features/student-community" element={<StudentCommunity />} />
          <Route path="/features/wellness-support" element={<WellnessSupport />} />
          <Route path="/features/document-tracker" element={<DocumentTracker />} />
          <Route path="/features/ai-assistant" element={<AIAssistant />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

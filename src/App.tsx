import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavigationChatBubble from "@/components/NavigationChatBubble";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Results = lazy(() => import("./pages/Results"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const SavedResults = lazy(() => import("./pages/SavedResults"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SmartMatching = lazy(() => import("./pages/features/SmartMatching"));
const ScholarshipDatabase = lazy(() => import("./pages/features/ScholarshipDatabase"));
const VisaGuidance = lazy(() => import("./pages/features/VisaGuidance"));
const HousingSolutions = lazy(() => import("./pages/features/HousingSolutions"));
const StudentCommunity = lazy(() => import("./pages/features/StudentCommunity"));
const WellnessSupport = lazy(() => import("./pages/features/WellnessSupport"));
const WellnessShop = lazy(() => import("./pages/features/WellnessShop"));
const WellnessCheckout = lazy(() => import("./pages/features/WellnessCheckout"));
const OrderConfirmation = lazy(() => import("./pages/features/OrderConfirmation"));
const MyOrders = lazy(() => import("./pages/features/MyOrders"));
const DocumentTracker = lazy(() => import("./pages/features/DocumentTracker"));
const AIAssistant = lazy(() => import("./pages/features/AIAssistant"));
const HousingQuestionnairePage = lazy(() => import("./pages/questionnaires/HousingQuestionnairePage"));
const VisaQuestionnairePage = lazy(() => import("./pages/questionnaires/VisaQuestionnairePage"));
const ScholarshipQuestionnairePage = lazy(() => import("./pages/questionnaires/ScholarshipQuestionnairePage"));
const SavedScholarships = lazy(() => import("./pages/features/SavedScholarships"));
const Scoreboard = lazy(() => import("./pages/Scoreboard"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/results" element={<Results />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/saved" element={<SavedResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/features/smart-matching" element={<SmartMatching />} />
            <Route path="/features/scholarship-database" element={<ScholarshipDatabase />} />
            <Route path="/features/visa-guidance" element={<VisaGuidance />} />
            <Route path="/features/housing-solutions" element={<HousingSolutions />} />
            <Route path="/features/student-community" element={<StudentCommunity />} />
            <Route path="/features/wellness-support" element={<WellnessSupport />} />
            <Route path="/wellness-shop" element={<WellnessShop />} />
            <Route path="/wellness-shop/checkout" element={<WellnessCheckout />} />
            <Route path="/wellness-shop/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/wellness-shop/my-orders" element={<MyOrders />} />
            <Route path="/features/document-tracker" element={<DocumentTracker />} />
            <Route path="/features/ai-assistant" element={<AIAssistant />} />
            <Route path="/questionnaires/housing" element={<HousingQuestionnairePage />} />
            <Route path="/questionnaires/visa" element={<VisaQuestionnairePage />} />
            <Route path="/questionnaires/scholarships" element={<ScholarshipQuestionnairePage />} />
            <Route path="/features/saved-scholarships" element={<SavedScholarships />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NavigationChatBubble />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

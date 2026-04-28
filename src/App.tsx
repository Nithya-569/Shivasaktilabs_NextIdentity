import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import AmbientBackground from "@/components/AmbientBackground";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import GrowPage from "./pages/GrowPage";
import SupportPage from "./pages/SupportPage";
import FindPage from "./pages/FindPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import AdminPage from "./pages/AdminPage";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AmbientBackground />
          <OnboardingChecklist />
          <TopNav />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/grow" element={<GrowPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/find" element={<FindPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* Legacy routes redirect to new structure */}
            <Route path="/jobs" element={<GrowPage />} />
            <Route path="/skills" element={<GrowPage />} />
            <Route path="/community" element={<ConnectPage />} />
            <Route path="/marketplace" element={<FindPage />} />
            <Route path="/events" element={<FindPage />} />
            <Route path="/map" element={<FindPage />} />
            <Route path="/mentors" element={<GrowPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

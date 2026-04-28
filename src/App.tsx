import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Matches from "./pages/Matches.tsx";
import Explore from "./pages/Explore.tsx";
import ListSkill from "./pages/ListSkill.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Chat from "./pages/Chat.tsx";
import Availability from "./pages/Availability.tsx";
import AdminModeration from "./pages/AdminModeration.tsx";
import Appeals from "./pages/Appeals.tsx";
import AdminAppeals from "./pages/AdminAppeals.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
import LocalCommunities from "./pages/LocalCommunities.tsx";
import CityHub from "./pages/CityHub.tsx";
import CitySkills from "./pages/CitySkills.tsx";
import Legal from "./pages/Legal.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/matches" element={<RequireAuth><Matches /></RequireAuth>} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/services/new" element={<RequireAuth><ListSkill /></RequireAuth>} />
            <Route path="/list-skill" element={<RequireAuth><ListSkill /></RequireAuth>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/chat/swap/:swapId" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/availability" element={<RequireAuth><Availability /></RequireAuth>} />
            <Route path="/admin/moderation" element={<RequireAuth><AdminModeration /></RequireAuth>} />
            <Route path="/appeals" element={<RequireAuth><Appeals /></RequireAuth>} />
            <Route path="/admin/appeals" element={<RequireAuth><AdminAppeals /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
            <Route path="/communities" element={<LocalCommunities />} />
            <Route path="/communities/:slug" element={<CityHub />} />
            <Route path="/communities/:slug/skills" element={<CitySkills />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/contact" element={<Legal />} />
            <Route path="/partners" element={<Legal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

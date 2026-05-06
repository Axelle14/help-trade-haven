import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "./components/RequireAuth.tsx";
import AppShell from "./components/AppShell.tsx";
import AppLoader from "./components/AppLoader.tsx";

// Eager: landing page (LCP) and auth — both are entry points users hit first.
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Privacy from "./pages/Privacy.tsx";
import DeleteAccount from "./pages/DeleteAccount.tsx";

// Lazy: every other route. Reduces initial JS by ~60% for first paint.
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Matches = lazy(() => import("./pages/Matches.tsx"));
const Explore = lazy(() => import("./pages/Explore.tsx"));
const ListSkill = lazy(() => import("./pages/ListSkill.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Chat = lazy(() => import("./pages/Chat.tsx"));
const Availability = lazy(() => import("./pages/Availability.tsx"));
const AdminModeration = lazy(() => import("./pages/AdminModeration.tsx"));
const Appeals = lazy(() => import("./pages/Appeals.tsx"));
const AdminAppeals = lazy(() => import("./pages/AdminAppeals.tsx"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics.tsx"));
const LocalCommunities = lazy(() => import("./pages/LocalCommunities.tsx"));
const CityHub = lazy(() => import("./pages/CityHub.tsx"));
const CitySkills = lazy(() => import("./pages/CitySkills.tsx"));
const Legal = lazy(() => import("./pages/Legal.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Welcome = lazy(() => import("./pages/Welcome.tsx"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShell>
            <Suspense fallback={<AppLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
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
                <Route path="/settings/notifications" element={<RequireAuth><NotificationSettings /></RequireAuth>} />
                <Route path="/admin/moderation" element={<RequireAuth><AdminModeration /></RequireAuth>} />
                <Route path="/appeals" element={<RequireAuth><Appeals /></RequireAuth>} />
                <Route path="/admin/appeals" element={<RequireAuth><AdminAppeals /></RequireAuth>} />
                <Route path="/admin/analytics" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
                <Route path="/communities" element={<LocalCommunities />} />
                <Route path="/communities/:slug" element={<CityHub />} />
                <Route path="/communities/:slug/skills" element={<CitySkills />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Legal />} />
                <Route path="/contact" element={<Legal />} />
                <Route path="/partners" element={<Legal />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

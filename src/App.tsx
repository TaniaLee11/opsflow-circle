import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserTierProvider } from "@/contexts/UserTierContext";
import { ClientViewProvider } from "@/contexts/ClientViewContext";
import { ClientViewBanner } from "@/components/client-view/ClientViewBanner";
import { SiteChatWidget } from "@/components/chat/SiteChatWidget";
import Landing from "./pages/Landing";
import Hub from "./pages/Hub";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AIStudio from "./pages/AIStudio";
import Academy from "./pages/Academy";
import FinancialHub from "./pages/FinancialHub";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import TierSelection from "./pages/TierSelection";
import ProductSelection from "./pages/ProductSelection";
import Studio from "./pages/Studio";
import Integrations from "./pages/Integrations";
import VOPSy from "./pages/VOPSy";
import Vault from "./pages/Vault";
import UserPortal from "./pages/UserPortal";
import IntegrationCallback from "./pages/IntegrationCallback";
import Workflows from "./pages/Workflows";
import Settings from "./pages/Settings";
import TaxSeason2026 from "./pages/TaxSeason2026";
import TaxServices from "./pages/TaxServices";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AnalyticsPortal from "./pages/AnalyticsPortal";
import FreeCourses from "./pages/FreeCourses";
import FreeCourse from "./pages/FreeCourse";
import BusinessHealthCheck from "./pages/BusinessHealthCheck";
import ManagedPartners from "./pages/ManagedPartners";
import Communications from "./pages/Communications";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

// Component to conditionally show chat widget
function ChatWidgetWrapper() {
  const location = useLocation();
  // Hide chat widget on VOPSy page (has its own chat) and auth pages
  const hiddenPaths = ["/vopsy", "/auth", "/onboarding"];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide) return null;
  return <SiteChatWidget />;
}

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="vops-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserTierProvider>
            <ClientViewProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ClientViewBanner />
                  <ChatWidgetWrapper />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/hub" element={<Hub />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/tax-season-2026" element={<TaxSeason2026 />} />
                    <Route path="/tax-services" element={<TaxServices />} />
                    <Route path="/free-courses" element={<FreeCourses />} />
                    <Route path="/free-courses/:courseId" element={<FreeCourse />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/health-check" element={<BusinessHealthCheck />} />
                    <Route path="/managed-partners" element={<ManagedPartners />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/select-tier" element={<TierSelection />} />
                    <Route path="/select-product" element={<ProductSelection />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/portal/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/analytics/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/vopsy" element={<ProtectedRoute><VOPSy /></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
                    <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
                    <Route path="/ai-studio" element={<ProtectedRoute><AIStudio /></ProtectedRoute>} />
                    <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />
                    <Route path="/financial" element={<ProtectedRoute><FinancialHub /></ProtectedRoute>} />
                    <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                    <Route path="/integrations/callback" element={<IntegrationCallback />} />
                    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                    <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-canceled" element={<PaymentCanceled />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ClientViewProvider>
          </UserTierProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;

import { HelmetProvider } from "react-helmet-async";
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
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/select-tier" element={<TierSelection />} />
                  <Route path="/select-product" element={<ProductSelection />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/portal/:tierId" element={<UserPortal />} />
                  <Route path="/vopsy" element={<VOPSy />} />
                  <Route path="/vault" element={<Vault />} />
                  <Route path="/studio" element={<Studio />} />
                  <Route path="/ai-studio" element={<AIStudio />} />
                  <Route path="/academy" element={<Academy />} />
                  <Route path="/financial" element={<FinancialHub />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/integrations/callback" element={<IntegrationCallback />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/settings" element={<Settings />} />
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
  </HelmetProvider>
);

export default App;

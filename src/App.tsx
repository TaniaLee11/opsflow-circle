import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserTierProvider } from "@/contexts/UserTierContext";
import { ClientViewProvider } from "@/contexts/ClientViewContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ClientViewBanner } from "@/components/client-view/ClientViewBanner";
import { SiteChatWidget } from "@/components/chat/SiteChatWidget";

// Public pages
import Landing from "./pages/Landing";
import Hub from "./pages/Hub";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import TaxSeason2026 from "./pages/TaxSeason2026";
import TaxServices from "./pages/TaxServices";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FreeCourses from "./pages/FreeCourses";
import FreeCourse from "./pages/FreeCourse";
import BusinessHealthCheck from "./pages/BusinessHealthCheck";
import ManagedPartners from "./pages/ManagedPartners";

// Core pages
import Dashboard from "./pages/Dashboard";
import VOPSy from "./pages/VOPSy";
import Academy from "./pages/Academy";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Marketing pages (2)
import Campaigns from "./pages/marketing/Campaigns";
import Audience from "./pages/marketing/Audience";

// Engagement pages (6)
import People from "./pages/engagement/People";
import Pipeline from "./pages/Pipeline";
import Documents from "./pages/engagement/Documents";
import Inbox from "./pages/clientcare/Inbox";
import Followups from "./pages/clientcare/Followups";
import Surveys from "./pages/clientcare/Surveys";

// Finance pages (7)
import Reconciliation from "./pages/finance/Reconciliation";
import TaxOrganizer from "./pages/finance/Tax";
import Reports from "./pages/finance/Reports";
import CashFlow from "./pages/finance/CashFlow";
import Banking from "./pages/finance/Banking";
import FundingReadiness from "./pages/finance/FundingReadiness";
import DonationGrantTracking from "./pages/finance/DonationGrantTracking";

// Systems pages (5)
import Integrations from "./pages/Integrations";
import Workflows from "./pages/Workflows";
import Calendar from "./pages/tools/Calendar";
import Tasks from "./pages/tools/Tasks";
import Vault from "./pages/Vault";

// People pages (2)
import Contractors from "./pages/people/Contractors";
import Payroll from "./pages/people/Payroll";

// Department dashboards (5)
import Marketing from "./pages/departments/Marketing";
import Engagement from "./pages/departments/Engagement";
import Finance from "./pages/departments/Finance";
import Systems from "./pages/departments/Systems";
import PeopleDept from "./pages/departments/People";

// Utility pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import ProductSelection from "./pages/ProductSelection";
import IntegrationCallback from "./pages/IntegrationCallback";
import AnalyticsPortal from "./pages/AnalyticsPortal";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TicketingWidget } from "@/components/TicketingWidget";

const queryClient = new QueryClient();

// Component to conditionally show chat widget
function ChatWidgetWrapper() {
  const location = useLocation();
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
                <ChatProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ClientViewBanner />
                  <ChatWidgetWrapper />
                  <TicketingWidget />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
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
                    <Route path="/select-tier" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/select-product" element={<ProductSelection />} />

                    {/* Core routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/vopsy" element={<ProtectedRoute><VOPSy /></ProtectedRoute>} />
                    <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />

                    {/* Marketing routes (2) */}
                    <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
                    <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
                    <Route path="/audience" element={<ProtectedRoute><Audience /></ProtectedRoute>} />

                    {/* Engagement routes (6) */}
                    <Route path="/engagement" element={<ProtectedRoute><Engagement /></ProtectedRoute>} />
                    <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
                    <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                    <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                    <Route path="/followups" element={<ProtectedRoute><Followups /></ProtectedRoute>} />
                    <Route path="/surveys" element={<ProtectedRoute><Surveys /></ProtectedRoute>} />

                    {/* Finance routes (7) */}
                    <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
                    <Route path="/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />
                    <Route path="/tax" element={<ProtectedRoute><TaxOrganizer /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/cashflow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
                    <Route path="/banking" element={<ProtectedRoute><Banking /></ProtectedRoute>} />
                    <Route path="/funding" element={<ProtectedRoute><FundingReadiness /></ProtectedRoute>} />
                    <Route path="/grants" element={<ProtectedRoute><DonationGrantTracking /></ProtectedRoute>} />

                    {/* Systems routes (5) */}
                    <Route path="/systems" element={<ProtectedRoute><Systems /></ProtectedRoute>} />
                    <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                    <Route path="/integrations/callback" element={<IntegrationCallback />} />
                    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />

                    {/* People routes (2) */}
                    <Route path="/contractors" element={<ProtectedRoute><PeopleDept /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />

                    {/* Utility routes */}
                    <Route path="/portal/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/analytics/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-canceled" element={<PaymentCanceled />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                </ChatProvider>
              </TooltipProvider>
            </ClientViewProvider>
          </UserTierProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;

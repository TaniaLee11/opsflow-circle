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

// Marketing pages
import SocialMedia from "./pages/marketing/SocialMedia";
import Campaigns from "./pages/marketing/Campaigns";
import Studio from "./pages/Studio";
import Funnels from "./pages/marketing/Funnels";
import Broadcast from "./pages/marketing/Broadcast";
import LeadCapture from "./pages/marketing/LeadCapture";
import ContentPlanner from "./pages/marketing/ContentPlanner";

// Sales pages
import Pipeline from "./pages/Pipeline";
import CRM from "./pages/sales/CRM";
import Deals from "./pages/sales/Deals";
import Proposals from "./pages/sales/Proposals";
import Contracts from "./pages/sales/Contracts";
import ClientOnboarding from "./pages/sales/ClientOnboarding";

// Support pages
import Communications from "./pages/Communications";
import Tickets from "./pages/support/Tickets";
import HelpDesk from "./pages/support/HelpDesk";
import InboundCampaigns from "./pages/support/InboundCampaigns";
import OutboundFollowup from "./pages/support/OutboundFollowup";
import Surveys from "./pages/support/Surveys";
import RetentionWorkflows from "./pages/support/RetentionWorkflows";

// Finance pages
import Reconciliation from "./pages/finance/Reconciliation";
import TaxOrganizer from "./pages/finance/Tax";
import Reports from "./pages/finance/Reports";
import CashFlow from "./pages/finance/CashFlow";
import Banking from "./pages/finance/Banking";
import FundingReadiness from "./pages/finance/FundingReadiness";
import DonationGrantTracking from "./pages/finance/DonationGrantTracking";

// Systems pages
import Integrations from "./pages/Integrations";
import Workflows from "./pages/Workflows";
import APIConnections from "./pages/systems/APIConnections";
import Webhooks from "./pages/systems/Webhooks";
import AIProcessTriggers from "./pages/systems/AIProcessTriggers";
import SystemLogs from "./pages/systems/SystemLogs";

// People pages
import Contractors from "./pages/people/Contractors";
import Roles from "./pages/people/Roles";
import Payroll from "./pages/people/Payroll";
import OnboardingDocuments from "./pages/people/OnboardingDocuments";
import HRCompliance from "./pages/people/HRCompliance";

// Tools pages
import Calendar from "./pages/tools/Calendar";
import Tasks from "./pages/tools/Tasks";
import Vault from "./pages/Vault";

// Department dashboards
import Marketing from "./pages/departments/Marketing";
import Sales from "./pages/departments/Sales";
import Support from "./pages/departments/Support";
import FinancePage from "./pages/departments/FinancePage";
import Systems from "./pages/departments/Systems";
import People from "./pages/departments/People";

// Utility pages
import AIStudio from "./pages/AIStudio";
import FinancialHub from "./pages/FinancialHub";
import Finance from "./pages/Finance";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import TierSelection from "./pages/TierSelection";
import ProductSelection from "./pages/ProductSelection";
import UserPortal from "./pages/UserPortal";
import IntegrationCallback from "./pages/IntegrationCallback";
import AnalyticsPortal from "./pages/AnalyticsPortal";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TicketingWidget } from "@/components/TicketingWidget";

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
                    <Route path="/select-tier" element={<TierSelection />} />
                    <Route path="/select-product" element={<ProductSelection />} />

                    {/* Core routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/vopsy" element={<ProtectedRoute><VOPSy /></ProtectedRoute>} />
                    <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />

                    {/* Marketing routes */}
                    <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
                    <Route path="/social" element={<ProtectedRoute><SocialMedia /></ProtectedRoute>} />
                    <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
                    <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
                    <Route path="/funnels" element={<ProtectedRoute><Funnels /></ProtectedRoute>} />
                    <Route path="/broadcast" element={<ProtectedRoute><Broadcast /></ProtectedRoute>} />
                    <Route path="/leads" element={<ProtectedRoute><LeadCapture /></ProtectedRoute>} />
                    <Route path="/content-planner" element={<ProtectedRoute><ContentPlanner /></ProtectedRoute>} />

                    {/* Sales routes */}
                    <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                    <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
                    <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
                    <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
                    <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
                    <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                    <Route path="/onboarding-workflows" element={<ProtectedRoute><ClientOnboarding /></ProtectedRoute>} />

                    {/* Support routes */}
                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/inbox" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
                    <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
                    <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                    <Route path="/helpdesk" element={<ProtectedRoute><HelpDesk /></ProtectedRoute>} />
                    <Route path="/inbound" element={<ProtectedRoute><InboundCampaigns /></ProtectedRoute>} />
                    <Route path="/outbound" element={<ProtectedRoute><OutboundFollowup /></ProtectedRoute>} />
                    <Route path="/surveys" element={<ProtectedRoute><Surveys /></ProtectedRoute>} />
                    <Route path="/retention" element={<ProtectedRoute><RetentionWorkflows /></ProtectedRoute>} />

                    {/* Finance routes */}
                    <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
                    <Route path="/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />
                    <Route path="/tax" element={<ProtectedRoute><TaxOrganizer /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/cashflow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
                    <Route path="/banking" element={<ProtectedRoute><Banking /></ProtectedRoute>} />
                    <Route path="/funding" element={<ProtectedRoute><FundingReadiness /></ProtectedRoute>} />
                    <Route path="/grants" element={<ProtectedRoute><DonationGrantTracking /></ProtectedRoute>} />

                    {/* Systems routes */}
                    <Route path="/systems" element={<ProtectedRoute><Systems /></ProtectedRoute>} />
                    <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                    <Route path="/integrations/callback" element={<IntegrationCallback />} />
                    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                    <Route path="/api" element={<ProtectedRoute><APIConnections /></ProtectedRoute>} />
                    <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
                    <Route path="/ai-triggers" element={<ProtectedRoute><AIProcessTriggers /></ProtectedRoute>} />
                    <Route path="/logs" element={<ProtectedRoute><SystemLogs /></ProtectedRoute>} />

                    {/* People routes */}
                    <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
                    <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
                    <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                    <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
                    <Route path="/onboarding-docs" element={<ProtectedRoute><OnboardingDocuments /></ProtectedRoute>} />
                    <Route path="/hr-compliance" element={<ProtectedRoute><HRCompliance /></ProtectedRoute>} />

                    {/* Tools routes */}
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />

                    {/* Utility routes */}
                    <Route path="/portal/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/analytics/:tierId" element={<AnalyticsPortal />} />
                    <Route path="/ai-studio" element={<ProtectedRoute><AIStudio /></ProtectedRoute>} />
                    <Route path="/financial" element={<ProtectedRoute><FinancialHub /></ProtectedRoute>} />
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

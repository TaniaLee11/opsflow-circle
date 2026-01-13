import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserTierProvider } from "@/contexts/UserTierContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AIStudio from "./pages/AIStudio";
import Academy from "./pages/Academy";
import FinancialHub from "./pages/FinancialHub";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserTierProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-studio" element={<AIStudio />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/financial" element={<FinancialHub />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/projects" element={<Dashboard />} />
              <Route path="/team" element={<Dashboard />} />
              <Route path="/invoicing" element={<FinancialHub />} />
              <Route path="/autoresponder" element={<Dashboard />} />
              <Route path="/marketing" element={<Dashboard />} />
              <Route path="/automations" element={<Dashboard />} />
              <Route path="/messages" element={<Dashboard />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserTierProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

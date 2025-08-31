import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SecurityProvider } from "./components/SecurityProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import Marketplace from "./pages/Marketplace";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";

import AgentTrial from "./pages/AgentTrial";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Chat } from "./pages/Chat";
import CreateAgent from "./pages/CreateAgent";
import { EditAgent } from "./pages/EditAgent";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { DollyCopilot } from "./components/DollyCopilot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <SecurityProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/success" element={<Success />} />
              <Route path="/marketplace" element={<ProtectedRoute><DashboardLayout><Marketplace /></DashboardLayout></ProtectedRoute>} />
              
              <Route path="/trial/:agentId" element={<AgentTrial />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
              <Route path="/edit-agent/:agentId" element={<ProtectedRoute><EditAgent /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/chat/:agentId" element={<ProtectedRoute><DashboardLayout><Chat /></DashboardLayout></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <DollyCopilot />
          </TooltipProvider>
        </ErrorBoundary>
      </SecurityProvider>
    </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
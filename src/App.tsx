import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminLeads from "./pages/admin/AdminLeads";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// Demo pages
import PlumbingDemo from "./pages/demos/PlumbingDemo";
import ElectricalDemo from "./pages/demos/ElectricalDemo";
import BuildingDemo from "./pages/demos/BuildingDemo";
import RoofingDemo from "./pages/demos/RoofingDemo";
import DrywallDemo from "./pages/demos/DrywallDemo";
import WellsDemo from "./pages/demos/WellsDemo";
import HeatingDemo from "./pages/demos/HeatingDemo";
import SolarDemo from "./pages/demos/SolarDemo";
import HeatpumpsDemo from "./pages/demos/HeatpumpsDemo";
import PaintingDemo from "./pages/demos/PaintingDemo";
import InteriorDemo from "./pages/demos/InteriorDemo";
import ExteriorDemo from "./pages/demos/ExteriorDemo";
import GardeningDemo from "./pages/demos/GardeningDemo";
import CleaningDemo from "./pages/demos/CleaningDemo";
import LocksmithDemo from "./pages/demos/LocksmithDemo";
import CarpentryDemo from "./pages/demos/CarpentryDemo";
import ConsultantJitka from "./pages/ConsultantJitka";
import CalculatorPage from "./pages/CalculatorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/demo/plumbing" element={<PlumbingDemo />} />
            <Route path="/demo/electrical" element={<ElectricalDemo />} />
            <Route path="/demo/building" element={<BuildingDemo />} />
            <Route path="/demo/roofing" element={<RoofingDemo />} />
            <Route path="/demo/drywall" element={<DrywallDemo />} />
            <Route path="/demo/wells" element={<WellsDemo />} />
            <Route path="/demo/heating" element={<HeatingDemo />} />
            <Route path="/demo/solar" element={<SolarDemo />} />
            <Route path="/demo/heatpumps" element={<HeatpumpsDemo />} />
            <Route path="/demo/painting" element={<PaintingDemo />} />
            <Route path="/demo/interior" element={<InteriorDemo />} />
            <Route path="/demo/exterior" element={<ExteriorDemo />} />
            <Route path="/demo/gardening" element={<GardeningDemo />} />
            <Route path="/demo/cleaning" element={<CleaningDemo />} />
            <Route path="/demo/locksmith" element={<LocksmithDemo />} />
            <Route path="/demo/carpentry" element={<CarpentryDemo />} />
            <Route path="/consultant/jitka" element={<ConsultantJitka />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

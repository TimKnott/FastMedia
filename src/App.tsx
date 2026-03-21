import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import AdminToolbar from "@/components/AdminToolbar";
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
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminLandingPage from "./pages/admin/AdminLandingPage";
import AdminDemos from "./pages/admin/AdminDemos";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminSitemap from "./pages/admin/AdminSitemap";
import AdminContentHistory from "./pages/admin/AdminContentHistory";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminVbout from "./pages/admin/AdminVbout";
import AdminEmbedCodes from "./pages/admin/AdminEmbedCodes";
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
import AutoRepairDemo from "./pages/demos/AutoRepairDemo";
import PestControlDemo from "./pages/demos/PestControlDemo";
import PhotographyDemo from "./pages/demos/PhotographyDemo";
import CateringDemo from "./pages/demos/CateringDemo";
import FitnessDemo from "./pages/demos/FitnessDemo";
import BeautySalonDemo from "./pages/demos/BeautySalonDemo";
import MovingDemo from "./pages/demos/MovingDemo";
import ITServicesDemo from "./pages/demos/ITServicesDemo";
import EshopDemo from "./pages/demos/EshopDemo";
import ConsultantTereza from "./pages/ConsultantTereza";
import CalculatorPage from "./pages/CalculatorPage";
import Install from "./pages/Install";
import WhatsAppFloat from "./components/WhatsAppFloat";
import EmbedCodeInjector from "./components/EmbedCodeInjector";
import SitemapRedirect from "./pages/SitemapRedirect";
import Inquiry from "./pages/Inquiry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <PreviewModeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminToolbar />
          <WhatsAppFloat />
          <EmbedCodeInjector />
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
            <Route path="/demo/autorepair" element={<AutoRepairDemo />} />
            <Route path="/demo/pestcontrol" element={<PestControlDemo />} />
            <Route path="/demo/photography" element={<PhotographyDemo />} />
            <Route path="/demo/catering" element={<CateringDemo />} />
            <Route path="/demo/fitness" element={<FitnessDemo />} />
            <Route path="/demo/beautysalon" element={<BeautySalonDemo />} />
            <Route path="/demo/moving" element={<MovingDemo />} />
            <Route path="/demo/itservices" element={<ITServicesDemo />} />
            <Route path="/demo/eshop" element={<EshopDemo />} />
            <Route path="/consultant/tereza" element={<ConsultantTereza />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/install" element={<Install />} />
            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/sitemap.xml" element={<SitemapRedirect />} />
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute minRole="editor"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="landing-page" element={<AdminLandingPage />} />
              <Route path="demos" element={<AdminDemos />} />
              <Route path="blog-manage" element={<AdminBlog />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="sitemap" element={<AdminSitemap />} />
              <Route path="content-history" element={<AdminContentHistory />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="vbout" element={<AdminVbout />} />
              <Route path="embed-codes" element={<AdminEmbedCodes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PreviewModeProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

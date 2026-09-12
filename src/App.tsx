import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import AdminToolbar from "@/components/AdminToolbar";
import WhatsAppFloat from "./components/WhatsAppFloat";
import EmbedCodeInjector from "./components/EmbedCodeInjector";
import CookieConsentBanner from "./components/CookieConsentBanner";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import { A11yProvider } from "./contexts/A11yContext";
import SuperAdminInboxBadge from "./components/SuperAdminInboxBadge";
import { PaymentTestModeBanner } from "./components/PaymentTestModeBanner";
import TrailingSlashRedirect from "./components/TrailingSlashRedirect";
import CursorFX from "./components/CursorFX";

// Critical pages loaded eagerly
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const ConsultantTereza = lazy(() => import("./pages/ConsultantTereza"));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage"));
const Install = lazy(() => import("./pages/Install"));
const Inquiry = lazy(() => import("./pages/Inquiry"));
const Contact = lazy(() => import("./pages/Contact"));
const QuoteRequest = lazy(() => import("./pages/QuoteRequest"));
const FeatureDetail = lazy(() => import("./pages/FeatureDetail"));
const PackageDetail = lazy(() => import("./pages/PackageDetail"));
const SitemapRedirect = lazy(() => import("./pages/SitemapRedirect"));
const Showcase = lazy(() => import("./pages/Showcase"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Account = lazy(() => import("./pages/Account"));
const OfferLanding = lazy(() => import("./pages/OfferLanding"));
const GrantGuide = lazy(() => import("./pages/GrantGuide"));
const GrantWizard = lazy(() => import("./pages/GrantWizard"));
const MediaKit = lazy(() => import("./pages/MediaKit"));
const ServiceLanding = lazy(() => import("./pages/ServiceLanding"));

// Admin pages (lazy)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminEnquiries = lazy(() => import("./pages/admin/AdminEnquiries"));
const AdminQuoteRequests = lazy(() => import("./pages/admin/AdminQuoteRequests"));
const AdminOfferLeads = lazy(() => import("./pages/admin/AdminOfferLeads"));
const AdminTracker = lazy(() => import("./pages/admin/AdminTracker"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminResetPassword = lazy(() => import("./pages/admin/AdminResetPassword"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminLandingPage = lazy(() => import("./pages/admin/AdminLandingPage"));
const AdminDemos = lazy(() => import("./pages/admin/AdminDemos"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminTtsTest = lazy(() => import("./pages/admin/AdminTtsTest"));
const AdminVboutDebug = lazy(() => import("./pages/admin/AdminVboutDebug"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminSitemap = lazy(() => import("./pages/admin/AdminSitemap"));
const AdminContentHistory = lazy(() => import("./pages/admin/AdminContentHistory"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminSEOInsights = lazy(() => import("./pages/admin/AdminSEOInsights"));
const AdminSEOHealth = lazy(() => import("./pages/admin/AdminSEOHealth"));
const AdminVbout = lazy(() => import("./pages/admin/AdminVbout"));
const AdminEmbedCodes = lazy(() => import("./pages/admin/AdminEmbedCodes"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminAccounting = lazy(() => import("./pages/admin/AdminAccounting"));
const AdminEmails = lazy(() => import("./pages/admin/AdminEmails"));
const AdminEmailQueue = lazy(() => import("./pages/admin/AdminEmailQueue"));
const AdminEmailDashboard = lazy(() => import("./pages/admin/AdminEmailDashboard"));
const AdminEmailDeliverability = lazy(() => import("./pages/admin/AdminEmailDeliverability"));
const AdminLeadEmails = lazy(() => import("./pages/admin/AdminLeadEmails"));
const AdminHR = lazy(() => import("./pages/admin/AdminHR"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminExport = lazy(() => import("./pages/admin/AdminExport"));
const AdminClientProjects = lazy(() => import("./pages/admin/AdminClientProjects"));
const AdminClientProjectDetail = lazy(() => import("./pages/admin/AdminClientProjectDetail"));
const AdminShowcase = lazy(() => import("./pages/admin/AdminShowcase"));
const AdminLegal = lazy(() => import("./pages/admin/AdminLegal"));
const LegalDocument = lazy(() => import("./pages/LegalDocument"));
const ClientPortal = lazy(() => import("./pages/portal/ClientPortal"));
const PortalErrorBoundary = lazy(() => import("./pages/portal/PortalErrorBoundary"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));

// Demo pages (lazy)
const PlumbingDemo = lazy(() => import("./pages/demos/PlumbingDemo"));
const ElectricalDemo = lazy(() => import("./pages/demos/ElectricalDemo"));
const BuildingDemo = lazy(() => import("./pages/demos/BuildingDemo"));
const RoofingDemo = lazy(() => import("./pages/demos/RoofingDemo"));
const DrywallDemo = lazy(() => import("./pages/demos/DrywallDemo"));
const WellsDemo = lazy(() => import("./pages/demos/WellsDemo"));
const HeatingDemo = lazy(() => import("./pages/demos/HeatingDemo"));
const SolarDemo = lazy(() => import("./pages/demos/SolarDemo"));
const HeatpumpsDemo = lazy(() => import("./pages/demos/HeatpumpsDemo"));
const PaintingDemo = lazy(() => import("./pages/demos/PaintingDemo"));
const InteriorDemo = lazy(() => import("./pages/demos/InteriorDemo"));
const ExteriorDemo = lazy(() => import("./pages/demos/ExteriorDemo"));
const GardeningDemo = lazy(() => import("./pages/demos/GardeningDemo"));
const CleaningDemo = lazy(() => import("./pages/demos/CleaningDemo"));
const LocksmithDemo = lazy(() => import("./pages/demos/LocksmithDemo"));
const CarpentryDemo = lazy(() => import("./pages/demos/CarpentryDemo"));
const AutoRepairDemo = lazy(() => import("./pages/demos/AutoRepairDemo"));
const PestControlDemo = lazy(() => import("./pages/demos/PestControlDemo"));
const PhotographyDemo = lazy(() => import("./pages/demos/PhotographyDemo"));
const CateringDemo = lazy(() => import("./pages/demos/CateringDemo"));
const FitnessDemo = lazy(() => import("./pages/demos/FitnessDemo"));
const BeautySalonDemo = lazy(() => import("./pages/demos/BeautySalonDemo"));
const MovingDemo = lazy(() => import("./pages/demos/MovingDemo"));
const ITServicesDemo = lazy(() => import("./pages/demos/ITServicesDemo"));
const EshopDemo = lazy(() => import("./pages/demos/EshopDemo"));
const WomenInBusinessDemo = lazy(() => import("./pages/demos/WomenInBusinessDemo"));
const VirtualAssistantDemo = lazy(() => import("./pages/demos/VirtualAssistantDemo"));
const WeddingPlannerDemo = lazy(() => import("./pages/demos/WeddingPlannerDemo"));
const FloristDemo = lazy(() => import("./pages/demos/FloristDemo"));
const BakeryDemo = lazy(() => import("./pages/demos/BakeryDemo"));
const YogaDemo = lazy(() => import("./pages/demos/YogaDemo"));
const NailSalonDemo = lazy(() => import("./pages/demos/NailSalonDemo"));
const MassageDemo = lazy(() => import("./pages/demos/MassageDemo"));
const PetGroomingDemo = lazy(() => import("./pages/demos/PetGroomingDemo"));
const NutritionistDemo = lazy(() => import("./pages/demos/NutritionistDemo"));
const HandmadeDemo = lazy(() => import("./pages/demos/HandmadeDemo"));
const ChildcareDemo = lazy(() => import("./pages/demos/ChildcareDemo"));
const DentalDemo = lazy(() => import("./pages/demos/DentalDemo"));
const RealEstateDemo = lazy(() => import("./pages/demos/RealEstateDemo"));
const AccountingDemo = lazy(() => import("./pages/demos/AccountingDemo"));
const VeterinaryDemo = lazy(() => import("./pages/demos/VeterinaryDemo"));
const TattooDemo = lazy(() => import("./pages/demos/TattooDemo"));
const MusicSchoolDemo = lazy(() => import("./pages/demos/MusicSchoolDemo"));
const DrivingSchoolDemo = lazy(() => import("./pages/demos/DrivingSchoolDemo"));
const LaundryDemo = lazy(() => import("./pages/demos/LaundryDemo"));
const SecurityDemo = lazy(() => import("./pages/demos/SecurityDemo"));
const TranslationDemo = lazy(() => import("./pages/demos/TranslationDemo"));
const CustomDemoPage = lazy(() => import("./pages/demos/CustomDemoPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="fastmedia-theme" disableTransitionOnChange>
      <A11yProvider>
      <LanguageProvider>
        <PreviewModeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TrailingSlashRedirect />
          <CursorFX />
          <PaymentTestModeBanner />
          <AdminToolbar />
          <WhatsAppFloat />
          <EmbedCodeInjector />
          <CookieConsentBanner />
          <AccessibilityToolbar />
          <SuperAdminInboxBadge />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/offer" element={<OfferLanding />} />
            <Route path="/grants" element={<GrantGuide />} />
            <Route path="/grant-wizard" element={<GrantWizard />} />
            <Route path="/media-kit" element={<MediaKit />} />
            <Route path="/service/:slug" element={<ServiceLanding />} />
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
            <Route path="/demo/womeninbusiness" element={<WomenInBusinessDemo />} />
            <Route path="/demo/virtualassistant" element={<VirtualAssistantDemo />} />
            <Route path="/demo/weddingplanner" element={<WeddingPlannerDemo />} />
            <Route path="/demo/florist" element={<FloristDemo />} />
            <Route path="/demo/bakery" element={<BakeryDemo />} />
            <Route path="/demo/yoga" element={<YogaDemo />} />
            <Route path="/demo/nailsalon" element={<NailSalonDemo />} />
            <Route path="/demo/massage" element={<MassageDemo />} />
            <Route path="/demo/petgrooming" element={<PetGroomingDemo />} />
            <Route path="/demo/nutritionist" element={<NutritionistDemo />} />
            <Route path="/demo/handmade" element={<HandmadeDemo />} />
            <Route path="/demo/childcare" element={<ChildcareDemo />} />
            <Route path="/demo/dental" element={<DentalDemo />} />
            <Route path="/demo/realestate" element={<RealEstateDemo />} />
            <Route path="/demo/accounting" element={<AccountingDemo />} />
            <Route path="/demo/veterinary" element={<VeterinaryDemo />} />
            <Route path="/demo/tattoo" element={<TattooDemo />} />
            <Route path="/demo/musicschool" element={<MusicSchoolDemo />} />
            <Route path="/demo/drivingschool" element={<DrivingSchoolDemo />} />
            <Route path="/demo/laundry" element={<LaundryDemo />} />
            <Route path="/demo/security" element={<SecurityDemo />} />
            <Route path="/demo/translation" element={<TranslationDemo />} />
            {/* Dynamic catch-all for AI-generated custom demos (must be LAST demo route) */}
            <Route path="/demo/:tradeId" element={<CustomDemoPage />} />
            <Route path="/consultant/tereza" element={<ConsultantTereza />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/install" element={<Install />} />
            <Route path="/inquiry" element={<Inquiry />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote-request" element={<QuoteRequest />} />

            <Route path="/feature/:featureId" element={<FeatureDetail />} />
            <Route path="/package/:slug" element={<PackageDetail />} />
            <Route path="/legal/:slug" element={<LegalDocument />} />
            <Route path="/sitemap.xml" element={<SitemapRedirect />} />
            <Route path="/showcase/:slug" element={<Showcase />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/return" element={<CheckoutSuccess />} />
            <Route path="/account" element={<Account />} />
            {/* Private client review portal — branded slug masks the token. Both shapes work. */}
            <Route path="/portal/:slug/:token" element={<PortalErrorBoundary><ClientPortal /></PortalErrorBoundary>} />
            <Route path="/portal/:token" element={<PortalErrorBoundary><ClientPortal /></PortalErrorBoundary>} />
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute minRole="editor"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="enquiries" element={<ProtectedRoute minRole="admin"><AdminEnquiries /></ProtectedRoute>} />
              <Route path="quote-requests" element={<ProtectedRoute minRole="admin"><AdminQuoteRequests /></ProtectedRoute>} />
              <Route path="offer-leads" element={<ProtectedRoute minRole="admin"><AdminOfferLeads /></ProtectedRoute>} />
              <Route path="tracker" element={<ProtectedRoute minRole="admin"><AdminTracker /></ProtectedRoute>} />
              <Route path="clients" element={<ProtectedRoute minRole="admin"><AdminClients /></ProtectedRoute>} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="landing-page" element={<AdminLandingPage />} />
              <Route path="demos" element={<AdminDemos />} />
              <Route path="blog-manage" element={<AdminBlog />} />
              <Route path="tts-test" element={<ProtectedRoute minRole="admin"><AdminTtsTest /></ProtectedRoute>} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="sitemap" element={<AdminSitemap />} />
              <Route path="content-history" element={<AdminContentHistory />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="seo-insights" element={<AdminSEOInsights />} />
              <Route path="seo-health" element={<AdminSEOHealth />} />
              <Route path="vbout" element={<AdminVbout />} />
              <Route path="vbout-debug" element={<ProtectedRoute minRole="admin"><AdminVboutDebug /></ProtectedRoute>} />
              <Route path="embed-codes" element={<AdminEmbedCodes />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="accounting" element={<AdminAccounting />} />
              <Route path="emails" element={<AdminEmails />} />
              <Route path="email-queue" element={<ProtectedRoute minRole="admin"><AdminEmailQueue /></ProtectedRoute>} />
              <Route path="email-deliverability" element={<ProtectedRoute minRole="admin"><AdminEmailDeliverability /></ProtectedRoute>} />
              <Route path="email-dashboard" element={<ProtectedRoute minRole="admin"><AdminEmailDashboard /></ProtectedRoute>} />
              <Route path="lead-emails" element={<AdminLeadEmails />} />
              <Route path="hr" element={<AdminHR />} />
              <Route path="integrations" element={<AdminIntegrations />} />
              <Route path="export" element={<AdminExport />} />
              <Route path="client-projects" element={<AdminClientProjects />} />
              <Route path="client-projects/:id" element={<AdminClientProjectDetail />} />
              <Route path="showcase" element={<ProtectedRoute minRole="admin"><AdminShowcase /></ProtectedRoute>} />
              <Route path="legal" element={<ProtectedRoute minRole="admin"><AdminLegal /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        </PreviewModeProvider>
      </LanguageProvider>
      </A11yProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

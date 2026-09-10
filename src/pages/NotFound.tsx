import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SEO: signal not-found to crawlers/prerenderers so 404 pages aren't indexed. */}
      <Helmet>
         <title>{isEnglish ? 'Page not found (404)' : 'Stránka nenalezena (404)'} | FastMedia.Pro</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="prerender-status-code" content="404" />
        <meta httpEquiv="Status" content="404 Not Found" />
        <link rel="canonical" href="https://www.fastmedia.pro/404" />
      </Helmet>
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
           <p className="mb-4 text-xl text-muted-foreground">{isEnglish ? 'Sorry, this page was not found' : 'Omlouváme se, tato stránka nebyla nalezena'}</p>
          <Link to="/" className="text-primary underline hover:text-primary/90">
             {isEnglish ? 'Return home' : 'Zpět na hlavní stránku'}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;

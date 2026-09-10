import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const Showcase = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const token = params.get("k") ?? "";
  const { language } = useLanguage();
  const en = language === 'en';
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; name?: string; url?: string }>({
    status: "loading",
  });

  useEffect(() => {
    // Prevent indexing
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!slug || !token) {
      setState({ status: "error" });
      return;
    }
    (async () => {
      const { data, error } = await supabase.functions.invoke("showcase-access", {
        body: { slug, token },
      });
      if (cancelled) return;
      if (error || !data?.url) {
        setState({ status: "error" });
        return;
      }
      document.title = data.name || "Showcase";
      setState({ status: "ok", name: data.name, url: data.url });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-3">
           <h1 className="text-2xl font-semibold text-foreground">{en ? 'Link invalid or expired' : 'Odkaz je neplatný nebo vypršel'}</h1>
          <p className="text-muted-foreground">
             {en ? 'This showcase link is no longer valid. Please request a new link from the project owner.' : 'Tento odkaz na ukázku již není platný. Požádejte vlastníka projektu o nový odkaz.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff" }}>
      <iframe
        src={state.url}
        title={state.name || "Showcase"}
        style={{ border: 0, width: "100vw", height: "100vh" }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
};

export default Showcase;

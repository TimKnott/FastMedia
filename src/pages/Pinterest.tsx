import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";

const mistakes = [
  ["01", "Slow loading speeds", "Optimise images, scripts and hosting so visitors can browse without waiting."],
  ["02", "Confusing navigation", "Make services, prices and contact information easy to find."],
  ["03", "Poor mobile design", "Make every page readable and easy to use on a phone."],
  ["04", "Weak calls to action", "Give visitors a clear next step on every important page."],
  ["05", "No online booking", "Let customers request appointments when it suits them."],
  ["06", "Complicated contact forms", "Ask only for the details needed to start the conversation."],
  ["07", "Disconnected CRM systems", "Send enquiries to a central place so follow-ups are not missed."],
];

export default function Pinterest() {
  return (
    <>
      <SEOHead title="Website Guides & Pinterest Resources | FastMedia.Pro" description="Practical website design, booking, e-commerce, search visibility and CRM guides from FastMedia.Pro." canonical="/pinterest" pagePath="/pinterest" />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FastMedia.Pro resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">Pinterest guides for better business websites</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">Practical visual guides for attracting customers, improving conversions and connecting your website with the tools your business uses.</p>
          <div className="mt-12 overflow-hidden rounded-3xl border bg-card shadow-lg">
            <div className="bg-slate-950 px-6 py-12 text-white md:px-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">FastMedia.Pro • Website checklist</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">7 Website Mistakes That Are Costing You Customers</h2>
              <p className="mt-4 max-w-2xl text-slate-300">Fix these common problems to help more visitors become enquiries and customers.</p>
              <div className="mt-9 grid gap-3 md:grid-cols-2">
                {mistakes.map(([number, title, advice]) => (
                  <div key={number} className="rounded-xl border border-white/15 bg-white/10 p-5">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-orange-300">{number}</span>
                      <div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">{advice}</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm font-semibold text-orange-300">fastmedia.pro</p>
            </div>
            <div className="px-6 py-7 md:px-12">
              <p className="text-muted-foreground">This is a web-native reconstruction of the first infographic's content; the original Pinterest image file has not yet been uploaded to this page.</p>
              <Link to="/contact" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">Discuss your website</Link>
            </div>
          </div>
          <p className="mt-10 text-sm text-muted-foreground">More website, SEO, e-commerce, booking and business automation guides will be added here.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

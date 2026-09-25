import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  ArrowLeft,
  Send,
  Sparkles,
  Heart,
  ThumbsUp,
  Quote,
  Calculator,
} from "lucide-react";
import calculatorPreview from "@/assets/calculator-preview.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SEOHead from "@/components/SEOHead";
import terezaPhoto from "@/assets/team/tereza-novakova.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const successStories = [
  {
    client: "Martin Kovář",
    trade: "Plumber",
    emoji: "🔧",
    story: `Martin came to us completely overwhelmed. He'd been relying on word-of-mouth for 15 years, but new competitors were popping up with flashy websites and stealing his customers. "I don't know where to start," he told Tereza on their first call. Tereza listened patiently, asked about his proudest jobs, and within an hour they'd sketched out a plan together. She suggested a clean, mobile-first website showcasing his emergency response times and a gallery of his best work. Martin was hesitant about the booking system — "My customers just call me!" — but Tereza showed him how online bookings could fill his quieter weekday slots. Three months later, Martin's calendar was full, and he told us: "Tereza didn't just build me a website, she helped me see my business differently."`,
  },
  {
    client: "Eva Nováková",
    trade: "Interior Designer",
    emoji: "🎨",
    story: `Eva had a beautiful portfolio on Instagram but no proper website. She was losing high-value clients who wanted to see a professional online presence before committing to large projects. When she contacted FastMedia.Pro, Tereza immediately understood the challenge: "Your work is stunning — we just need to let it breathe on a proper stage." Together they designed a visually rich portfolio site with full-screen project galleries, client testimonials integrated into each project story, and a sophisticated enquiry form that pre-qualified leads. Eva was amazed at how Tereza turned her scattered ideas into a cohesive brand story. Within weeks of launch, Eva landed her biggest contract yet — a full apartment redesign — and the client said they chose her specifically because her website "looked like she meant business."`,
  },
  {
    client: "Tomáš Dvořák",
    trade: "Electrician",
    emoji: "⚡",
    story: `Tomáš had an outdated website that hadn't been touched in five years. It looked like it was built in the early 2000s, and his Google reviews — all 4.9 stars — were buried and invisible to new visitors. Tereza's approach was warm but direct: "Tomáš, your reputation is gold. Let's make sure the world can see it." She proposed a complete makeover with his glowing reviews front and centre, an interactive service area map, and a one-click emergency call button for mobile users. Tomáš was nervous about change, but Tereza walked him through every decision, showing him live mockups so nothing felt like a surprise. The result? A 60% increase in enquiries in the first month, and Tomáš now sends Tereza a thank-you message every time a new customer mentions finding him online.`,
  },
  {
    client: "Lucie Šťastná",
    trade: "Cleaning Service",
    emoji: "✨",
    story: `Lucie ran a growing cleaning company but was drowning in admin. She spent hours every week answering the same questions about pricing and availability over the phone. Tereza proposed something transformative: a website with a smart quote calculator and an automated booking system. "But won't that feel impersonal?" Lucie worried. Tereza smiled and said, "Not if we do it right." Together they crafted a warm, friendly website that felt like talking to a real person — complete with Lucie's own photos and her team's cheerful bios. The calculator gave instant estimates, and the booking form asked just enough questions to prepare each visit perfectly. Lucie's phone calls dropped by 70%, but her bookings doubled. "I actually have weekends again," she laughed. "Tereza gave me my life back."`,
  },
];

const clientReviews = [
  {
    name: "Petr Horák",
    rating: 5,
    text: "Tereza was incredibly patient and really listened to what I needed. She made the whole process feel easy and even fun!",
    trade: "Roofer",
  },
  {
    name: "Jana Procházková",
    rating: 5,
    text: "I was nervous about getting a website, but Tereza explained everything step by step. The result exceeded all my expectations.",
    trade: "Gardener",
  },
  {
    name: "Ondřej Malý",
    rating: 5,
    text: "Tereza understood my business better than I did after just one conversation. Truly a professional who cares.",
    trade: "Builder",
  },
  {
    name: "Kateřina Černá",
    rating: 5,
    text: "Working with Tereza felt like working with a friend. She was always available, always cheerful, and the website is beautiful.",
    trade: "Painter",
  },
  {
    name: "David Veselý",
    rating: 5,
    text: "I recommended Tereza to three other tradespeople after she helped me. She's the real deal - knowledgeable, kind, and efficient.",
    trade: "Heating Engineer",
  },
  {
    name: "Markéta Svobodová",
    rating: 5,
    text: "Tereza turned my vague ideas into a stunning website. She has a gift for understanding what customers actually need.",
    trade: "Locksmith",
  },
  {
    name: "Filip Král",
    rating: 4,
    text: "Great experience overall. Tereza was very responsive and helped me choose the perfect package for my budget.",
    trade: "Solar Installer",
  },
  {
    name: "Tereza Pokorná",
    rating: 5,
    text: "I can't say enough good things about Tereza. She made everything so simple and the results speak for themselves — more customers every week!",
    trade: "Drywall Specialist",
  },
];

const czechStories = [
  { client: 'Martin Kovář', trade: 'Instalatér', emoji: '🔧', story: 'Martin se patnáct let spoléhal na doporučení, ale noví konkurenti mu začali získávat zákazníky lepšími weby. Tereza s ním připravila čistý mobilní web s ukázkami práce a online rezervacemi. Za tři měsíce měl kalendář plný a získal nový pohled na své podnikání.' },
  { client: 'Eva Nováková', trade: 'Interiérová designérka', emoji: '🎨', story: 'Eva měla krásné portfolio na Instagramu, ale chyběl jí profesionální web pro hodnotnější zakázky. S Terezou vytvořily výrazné portfolio s referencemi a formulářem, který lépe třídí poptávky. Krátce po spuštění získala dosud největší zakázku.' },
  { client: 'Tomáš Dvořák', trade: 'Elektrikář', emoji: '⚡', story: 'Tomášův zastaralý web skrýval jeho skvělé recenze. Tereza navrhla moderní prezentaci s hodnoceními, mapou oblasti a rychlým nouzovým voláním. V prvním měsíci vzrostl počet poptávek o 60 %.' },
  { client: 'Lucie Šťastná', trade: 'Úklidové služby', emoji: '✨', story: 'Lucie trávila hodiny telefonáty o cenách a dostupnosti. Chytrá kalkulačka a automatické rezervace zachovaly přátelský dojem, snížily počet telefonátů o 70 % a zdvojnásobily rezervace.' },
];

const czechReviews = [
  ['Petr Horák', 'Pokrývač', 'Tereza byla neuvěřitelně trpělivá a opravdu poslouchala, co potřebuji. Celý proces byl snadný a příjemný!'],
  ['Jana Procházková', 'Zahradnice', 'Z webu jsem měla obavy, ale Tereza vše vysvětlila krok za krokem. Výsledek překonal má očekávání.'],
  ['Ondřej Malý', 'Stavitel', 'Po jediném rozhovoru Tereza pochopila mé podnikání. Je to profesionálka, které na zákaznících záleží.'],
  ['Kateřina Černá', 'Malířka', 'Spolupráce s Terezou byla jako práce s kamarádkou. Vždy byla k dispozici a web je krásný.'],
  ['David Veselý', 'Topenář', 'Po naší spolupráci jsem Terezu doporučil dalším třem řemeslníkům. Je znalá, milá a efektivní.'],
  ['Markéta Svobodová', 'Zámečnice', 'Tereza proměnila mé neurčité nápady v nádherný web. Výborně chápe, co zákazníci potřebují.'],
  ['Filip Král', 'Montáž solárních systémů', 'Skvělá zkušenost. Tereza reagovala rychle a pomohla mi vybrat správný balíček pro můj rozpočet.'],
  ['Tereza Pokorná', 'Sádrokartonářka', 'Vše velmi zjednodušila a výsledky mluví samy za sebe — každý týden máme více zákazníků!'],
].map(([name, trade, text], index) => ({ name, trade, text, rating: index === 6 ? 4 : 5 }));

const ConsultantTereza = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const stories = en ? successStories : czechStories;
  const reviews = en ? clientReviews : czechReviews;
  const [callbackDate, setCallbackDate] = useState<Date>();
  const [callbackTime, setCallbackTime] = useState("");
  const [enquiryType, setEnquiryType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

     toast.success(en ? 'Your enquiry has been sent to Tereza. She will reply shortly.' : 'Vaše poptávka byla odeslána Tereze. Brzy se vám ozve.');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
    setCallbackDate(undefined);
    setCallbackTime("");
    setEnquiryType("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
         title={en ? 'Tereza Nováková — Web Consultant' : 'Tereza Nováková — webová konzultantka'}
         description={en ? 'Meet Tereza Nováková, your personal web consultant at FastMedia.Pro.' : 'Seznamte se s Terezou Novákovou, osobní webovou konzultantkou FastMedia.Pro.'}
        canonical="/consultant/tereza"
        ogType="profile"
        pagePath="/consultant/tereza"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Tereza Nováková',
          jobTitle: 'Web Consultant & Business Manager',
          worksFor: { '@type': 'Organization', name: 'FastMedia.Pro' },
          url: 'https://www.fastmedia.pro/consultant/tereza',
        }) }}
      />
      <ScrollToTop />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 lg:pt-36 pb-20 gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-accent"
              style={{ width: 200 + i * 80, height: 200 + i * 80, top: `${10 + i * 15}%`, left: `${60 + i * 8}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-accent/50 shadow-glow">
                <img src={terezaPhoto} alt="Tereza Nováková" className="w-full h-full object-cover" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 w-16 h-16 gradient-accent rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-7 h-7 text-accent-foreground" />
              </motion.div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center lg:text-left max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-semibold mb-4">
                 {en ? 'Your Personal Consultant' : 'Vaše osobní konzultantka'}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-primary-foreground">
                 {en ? "Hi, I'm Tereza Nováková" : 'Dobrý den, jsem Tereza Nováková'}
              </h1>
              <p className="text-lg lg:text-xl text-primary-foreground/90 leading-relaxed mb-4">
                 {en ? "Welcome! I'll guide you through every step of creating the right website for your business, from features and design to strategy." : 'Vítejte! Provedu vás každým krokem tvorby správného webu — od funkcí a designu až po strategii, která bude pro vaše podnikání skutečně fungovat.'}
              </p>
              <p className="text-primary-foreground/80 leading-relaxed">
                 {en ? "With years of experience helping tradespeople and small businesses across Czechia, I understand your challenges. Let's turn your vision into something customers will love." : 'Díky zkušenostem s řemeslníky a malými firmami v celé České republice rozumím vašim výzvám. Proměňme vaši představu v něco, co si zákazníci oblíbí.'}
              </p>
              <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                <a href="#contact">
                  <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity gap-2 h-12 px-8">
                     <MessageCircle className="w-5 h-5" /> {en ? 'Get in touch' : 'Kontaktovat Terezu'}
                  </Button>
                </a>
                <a href="#stories">
                  <Button
                    variant="outline"
                    className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 gap-2"
                  >
                     <Heart className="w-5 h-5" /> {en ? 'Read success stories' : 'Přečíst příběhy klientů'}
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
             <span className="text-accent font-semibold text-sm uppercase tracking-wider">{en ? 'Success Stories' : 'Příběhy úspěchu'}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
               {en ? 'Real Customers, Real Results' : 'Skuteční zákazníci, skutečné výsledky'}
            </h2>
            <p className="text-muted-foreground text-lg">
               {en ? 'Every project is a journey. Here are stories from customers Tereza has helped.' : 'Každý projekt je cesta. Přečtěte si příběhy zákazníků, kterým Tereza pomohla.'}
            </p>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
             {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-lg transition-shadow border border-border/50"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-2xl">
                    {story.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">{story.client}</h3>
                    <p className="text-accent font-medium text-sm">{story.trade}</p>
                  </div>
                  <ThumbsUp className="w-6 h-6 text-accent ml-auto" />
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-accent/20" />
                  <p className="text-foreground/80 leading-relaxed pl-6">{story.story}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Calculator Advert */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/calculator" className="block group">
              <div className="max-w-4xl mx-auto bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-lg transition-all flex flex-col md:flex-row">
                <div className="md:w-2/5 relative overflow-hidden">
                  <img
                    src={calculatorPreview}
                    alt="AI Website Calculator"
                    className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent flex items-center justify-center md:hidden">
                    <Calculator className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <div className="md:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
                  <span className="text-accent font-semibold text-xs uppercase tracking-wider mb-2">
                     {en ? 'AI-Powered Tool' : 'Nástroj s umělou inteligencí'}
                  </span>
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-foreground mb-2">
                     {en ? 'Try Our Smart Website Calculator' : 'Vyzkoušejte chytrou kalkulačku webu'}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                     {en ? 'Get an instant, personalised website quote. AI recommends suitable features and creates a price breakdown in seconds.' : 'Získejte okamžitou nabídku webu na míru. AI doporučí vhodné funkce pro váš obor a během několika sekund připraví rozpis ceny.'}
                  </p>
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                    <Calculator className="w-4 h-4" />
                     {en ? 'Build Your Quote Now →' : 'Sestavit nabídku →'}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
             <span className="text-accent font-semibold text-sm uppercase tracking-wider">{en ? 'Client Reviews' : 'Hodnocení klientů'}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
               {en ? 'What People Say About Tereza' : 'Co klienti říkají o Tereze'}
            </h2>
          </motion.div>

          {/* Scrolling reviews - two rows */}
          <div className="space-y-6">
            {[0, 1].map((row) => (
              <div key={row} className="relative">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: row === 0 ? [0, -1200] : [-1200, 0] }}
                  transition={{ duration: 30 + row * 5, repeat: Infinity, ease: "linear" }}
                >
                   {[...reviews, ...reviews]
                    .slice(row * 4, row * 4 + 8)
                     .concat([...reviews, ...reviews].slice(row * 4, row * 4 + 8))
                    .map((review, i) => (
                      <div
                        key={i}
                        className="min-w-[340px] bg-card rounded-2xl p-6 shadow-card border border-border/50"
                      >
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s < review.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <p className="text-foreground/80 mb-4 leading-relaxed text-sm">"{review.text}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{review.name}</p>
                            <p className="text-muted-foreground text-xs">{review.trade}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
             <span className="text-accent font-semibold text-sm uppercase tracking-wider">{en ? 'Get in Touch' : 'Kontakt'}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
               {en ? 'Contact Tereza' : 'Kontaktujte Terezu'}
            </h2>
            <p className="text-muted-foreground text-lg">
               {en ? 'Fill in your details and Tereza will reply personally. You can also request a callback.' : 'Vyplňte své údaje a Tereza se vám osobně ozve. Můžete také požádat o zpětné zavolání.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-8 lg:p-10 shadow-card border border-border/50 space-y-6"
            >
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                   <Label htmlFor="firstName">{en ? 'First name *' : 'Jméno *'}</Label>
                  <Input id="firstName" name="firstName" required placeholder="e.g. Martin" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="lastName">{en ? 'Last name *' : 'Příjmení *'}</Label>
                  <Input id="lastName" name="lastName" required placeholder="e.g. Kovář" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="phone">{en ? 'Phone number' : 'Telefon'}</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+420 ..." />
                </div>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="whatsapp">{en ? 'WhatsApp number *' : 'Číslo WhatsApp *'}</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="whatsapp" name="whatsapp" required placeholder="+420 ..." className="pl-10" />
                </div>
              </div>

              {/* Enquiry Type */}
              <div className="space-y-2">
                 <Label>{en ? 'Type of enquiry *' : 'Typ poptávky *'}</Label>
                <Select value={enquiryType} onValueChange={setEnquiryType} required>
                  <SelectTrigger>
                     <SelectValue placeholder={en ? 'What are you looking for?' : 'Co hledáte?'} />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="new-website">🌐 {en ? 'New website' : 'Nový web'}</SelectItem>
                     <SelectItem value="makeover">✨ {en ? 'Website redesign' : 'Redesign webu'}</SelectItem>
                     <SelectItem value="seo">📈 {en ? 'SEO & online visibility' : 'SEO a viditelnost'}</SelectItem>
                     <SelectItem value="booking-system">📅 {en ? 'Booking system' : 'Rezervační systém'}</SelectItem>
                     <SelectItem value="branding">🎨 {en ? 'Branding & logo' : 'Značka a logo'}</SelectItem>
                     <SelectItem value="other">💬 {en ? 'Something else' : 'Něco jiného'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                 <Label htmlFor="message">{en ? 'Tell Tereza about your project *' : 'Popište Tereze svůj projekt *'}</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                   placeholder={en ? 'Describe your business, what you need and any specific wishes…' : 'Popište své podnikání, potřeby a zvláštní přání…'}
                />
              </div>

              {/* Callback Section */}
              <div className="border border-border rounded-xl p-5 space-y-4 bg-secondary/30">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Phone className="w-5 h-5 text-accent" />
                   <span>{en ? 'Request a callback (optional)' : 'Požádat o zavolání (nepovinné)'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                     <Label>{en ? 'Preferred date' : 'Preferované datum'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !callbackDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                           {callbackDate ? format(callbackDate, "PPP") : (en ? 'Pick a date' : 'Vyberte datum')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={callbackDate}
                          onSelect={setCallbackDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                     <Label>{en ? 'Preferred time' : 'Preferovaný čas'}</Label>
                    <Select value={callbackTime} onValueChange={setCallbackTime}>
                      <SelectTrigger>
                         <SelectValue placeholder={en ? 'Choose a time' : 'Vyberte čas'} />
                      </SelectTrigger>
                      <SelectContent>
                        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(
                          (time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-accent text-accent-foreground font-semibold shadow-glow h-12 text-base gap-2"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <Send className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                     <Send className="w-5 h-5" /> {en ? 'Send enquiry to Tereza' : 'Odeslat poptávku Tereze'}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                 {en ? <>Your enquiry will go directly to <strong>Tereza Nováková</strong>, who usually replies within 24 hours.</> : <>Vaše poptávka bude odeslána přímo <strong>Tereze Novákové</strong>, která obvykle odpoví do 24 hodin.</>}
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConsultantTereza;
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
import jitkaPhoto from "@/assets/team/jitka-Líšťanská.jpg";

const successStories = [
  {
    client: "Martin Kovář",
    trade: "Plumber",
    emoji: "🔧",
    story: `Martin came to us completely overwhelmed. He'd been relying on word-of-mouth for 15 years, but new competitors were popping up with flashy websites and stealing his customers. "I don't know where to start," he told Jitka on their first call. Jitka listened patiently, asked about his proudest jobs, and within an hour they'd sketched out a plan together. She suggested a clean, mobile-first website showcasing his emergency response times and a gallery of his best work. Martin was hesitant about the booking system — "My customers just call me!" — but Jitka showed him how online bookings could fill his quieter weekday slots. Three months later, Martin's calendar was full, and he told us: "Jitka didn't just build me a website, she helped me see my business differently."`,
  },
  {
    client: "Eva Nováková",
    trade: "Interior Designer",
    emoji: "🎨",
    story: `Eva had a beautiful portfolio on Instagram but no proper website. She was losing high-value clients who wanted to see a professional online presence before committing to large projects. When she contacted FastMedia.Pro, Jitka immediately understood the challenge: "Your work is stunning — we just need to let it breathe on a proper stage." Together they designed a visually rich portfolio site with full-screen project galleries, client testimonials integrated into each project story, and a sophisticated enquiry form that pre-qualified leads. Eva was amazed at how Jitka turned her scattered ideas into a cohesive brand story. Within weeks of launch, Eva landed her biggest contract yet — a full apartment redesign — and the client said they chose her specifically because her website "looked like she meant business."`,
  },
  {
    client: "Tomáš Dvořák",
    trade: "Electrician",
    emoji: "⚡",
    story: `Tomáš had an outdated website that hadn't been touched in five years. It looked like it was built in the early 2000s, and his Google reviews — all 4.9 stars — were buried and invisible to new visitors. Jitka's approach was warm but direct: "Tomáš, your reputation is gold. Let's make sure the world can see it." She proposed a complete makeover with his glowing reviews front and centre, an interactive service area map, and a one-click emergency call button for mobile users. Tomáš was nervous about change, but Jitka walked him through every decision, showing him live mockups so nothing felt like a surprise. The result? A 60% increase in enquiries in the first month, and Tomáš now sends Jitka a thank-you message every time a new customer mentions finding him online.`,
  },
  {
    client: "Lucie Šťastná",
    trade: "Cleaning Service",
    emoji: "✨",
    story: `Lucie ran a growing cleaning company but was drowning in admin. She spent hours every week answering the same questions about pricing and availability over the phone. Jitka proposed something transformative: a website with a smart quote calculator and an automated booking system. "But won't that feel impersonal?" Lucie worried. Jitka smiled and said, "Not if we do it right." Together they crafted a warm, friendly website that felt like talking to a real person — complete with Lucie's own photos and her team's cheerful bios. The calculator gave instant estimates, and the booking form asked just enough questions to prepare each visit perfectly. Lucie's phone calls dropped by 70%, but her bookings doubled. "I actually have weekends again," she laughed. "Jitka gave me my life back."`,
  },
];

const clientReviews = [
  {
    name: "Petr Horák",
    rating: 5,
    text: "Jitka was incredibly patient and really listened to what I needed. She made the whole process feel easy and even fun!",
    trade: "Roofer",
  },
  {
    name: "Jana Procházková",
    rating: 5,
    text: "I was nervous about getting a website, but Jitka explained everything step by step. The result exceeded all my expectations.",
    trade: "Gardener",
  },
  {
    name: "Ondřej Malý",
    rating: 5,
    text: "Jitka understood my business better than I did after just one conversation. Truly a professional who cares.",
    trade: "Builder",
  },
  {
    name: "Kateřina Černá",
    rating: 5,
    text: "Working with Jitka felt like working with a friend. She was always available, always cheerful, and the website is beautiful.",
    trade: "Painter",
  },
  {
    name: "David Veselý",
    rating: 5,
    text: "I recommended Jitka to three other tradespeople after she helped me. She's the real deal - knowledgeable, kind, and efficient.",
    trade: "Heating Engineer",
  },
  {
    name: "Markéta Svobodová",
    rating: 5,
    text: "Jitka turned my vague ideas into a stunning website. She has a gift for understanding what customers actually need.",
    trade: "Locksmith",
  },
  {
    name: "Filip Král",
    rating: 4,
    text: "Great experience overall. Jitka was very responsive and helped me choose the perfect package for my budget.",
    trade: "Solar Installer",
  },
  {
    name: "Tereza Pokorná",
    rating: 5,
    text: "I can't say enough good things about Jitka. She made everything so simple and the results speak for themselves — more customers every week!",
    trade: "Drywall Specialist",
  },
];

const ConsultantJitka = () => {
  const [callbackDate, setCallbackDate] = useState<Date>();
  const [callbackTime, setCallbackTime] = useState("");
  const [enquiryType, setEnquiryType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Your enquiry has been sent to Jitka! She will get back to you shortly.");
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
    setCallbackDate(undefined);
    setCallbackTime("");
    setEnquiryType("");
  };

  return (
    <div className="min-h-screen bg-background">
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
                <img src={jitkaPhoto} alt="Jitka Líšťanská" className="w-full h-full object-cover" />
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
                Your Personal Consultant
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-primary-foreground">
                Hi, I'm Jitka Listanská
              </h1>
              <p className="text-lg lg:text-xl text-primary-foreground/90 leading-relaxed mb-4">
                Welcome! I'm here to guide you through every step of creating the perfect website for your business.
                Whether you're starting from scratch or refreshing an existing site, I'll help you choose the right
                features, design, and strategy — so your online presence truly works for you.
              </p>
              <p className="text-primary-foreground/80 leading-relaxed">
                With years of experience helping tradespeople and small businesses across Czechia, I understand the
                unique challenges you face. Let's turn your vision into something your customers will love.
              </p>
              <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                <a href="#contact">
                  <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity gap-2 h-12 px-8">
                    <MessageCircle className="w-5 h-5" /> Get in Touch
                  </Button>
                </a>
                <a href="#stories">
                  <Button
                    variant="outline"
                    className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 gap-2"
                  >
                    <Heart className="w-5 h-5" /> Read Success Stories
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Success Stories</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
              Real Customers, Real Results
            </h2>
            <p className="text-muted-foreground text-lg">
              Every project is a journey. Here are some stories from customers Jitka has helped along the way.
            </p>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {successStories.map((story, index) => (
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
                    AI-Powered Tool
                  </span>
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-foreground mb-2">
                    Try Our Smart Website Calculator
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Get an instant, personalised quote for your website. Our AI recommends the best features for your
                    trade and builds a custom price breakdown in seconds.
                  </p>
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                    <Calculator className="w-4 h-4" />
                    Build Your Quote Now →
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Client Reviews</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
              What People Say About Jitka
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
                  {[...clientReviews, ...clientReviews]
                    .slice(row * 4, row * 4 + 8)
                    .concat([...clientReviews, ...clientReviews].slice(row * 4, row * 4 + 8))
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
              Contact Jitka
            </h2>
            <p className="text-muted-foreground text-lg">
              Fill in your details below and Jitka will get back to you personally. You can also request a callback at a
              time that suits you.
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
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required placeholder="e.g. Martin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required placeholder="e.g. Kovář" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+420 ..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="whatsapp" name="whatsapp" required placeholder="+420 ..." className="pl-10" />
                </div>
              </div>

              {/* Enquiry Type */}
              <div className="space-y-2">
                <Label>Type of Enquiry *</Label>
                <Select value={enquiryType} onValueChange={setEnquiryType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you looking for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-website">🌐 New Website</SelectItem>
                    <SelectItem value="makeover">✨ Website Makeover / Redesign</SelectItem>
                    <SelectItem value="seo">📈 SEO & Online Visibility</SelectItem>
                    <SelectItem value="booking-system">📅 Booking System</SelectItem>
                    <SelectItem value="branding">🎨 Branding & Logo</SelectItem>
                    <SelectItem value="other">💬 Something Else</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Tell Jitka about your project *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Describe what you need, your business, any specific wishes..."
                />
              </div>

              {/* Callback Section */}
              <div className="border border-border rounded-xl p-5 space-y-4 bg-secondary/30">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>Request a Callback (optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
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
                          {callbackDate ? format(callbackDate, "PPP") : "Pick a date"}
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
                    <Label>Preferred Time</Label>
                    <Select value={callbackTime} onValueChange={setCallbackTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time" />
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
                    <Send className="w-5 h-5" /> Send Enquiry to Jitka
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your enquiry will be sent directly to <strong>Jitka Líšťanská</strong> at FastMedia.Pro. She typically
                responds within 24 hours.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConsultantJitka;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight, 
  Calendar,
  Building2,
  Factory,
  User,
  Heart,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  BookOpen,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import { useState } from "react";

// Calculate days until deadline
const getDaysUntil = (dateStr: string) => {
  const deadline = new Date(dateStr);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Tax deadline data with CTAs and engaging copy
const taxSlides = [
  {
    id: "welcome",
    type: "intro",
    title: "Tax Season 2026",
    subtitle: "Your Complete Filing Guide",
    icon: Calendar,
    color: "from-primary to-primary/70",
    headline: "Know Your Deadlines. File with Confidence.",
    description: "We've helped hundreds of businesses and nonprofits file on time with zero stress. Here's everything you need to know for 2026.",
    stats: [
      { value: "500+", label: "Clients Served" },
      { value: "99.8%", label: "On-Time Filing Rate" },
      { value: "12+", label: "Years Experience" }
    ],
    cta: "See What's Coming →",
    ctaAction: "next"
  },
  {
    id: "irs-opens",
    type: "info",
    title: "IRS E-File Opens",
    subtitle: "Mark Your Calendar",
    icon: Calendar,
    color: "from-blue-500 to-cyan-400",
    headline: "Get Ready to File Early",
    description: "Early filers often receive refunds faster and have more time to address any issues. Our team is ready to help you file as soon as systems open.",
    items: [
      { date: "January 13, 2026", badge: "Business & Nonprofits", description: "E-file opens at 9 a.m. ET for business returns" },
      { date: "January 26, 2026", badge: "Individuals", description: "Form 1040 e-filing begins" }
    ],
    tip: "💡 Pro tip: Gather your documents now so you're ready to file Day 1.",
    cta: "Get Your Documents Ready",
    ctaAction: "signup"
  },
  {
    id: "partnerships",
    type: "deadline",
    title: "Partnerships & S Corps",
    subtitle: "Form 1065 & 1120-S",
    icon: Building2,
    color: "from-purple-500 to-pink-400",
    deadline: "March 15, 2026",
    extension: "September 15, 2026",
    headline: "First Major Deadline of the Year",
    description: "Multi-member LLCs and S Corps file here. Our clients appreciate that we handle the complexity so they can focus on running their business.",
    testimonial: {
      quote: "They made our first S Corp filing feel effortless.",
      author: "Sarah K., Tech Growing organization Founder"
    },
    cta: "Let's Get You Filed",
    ctaAction: "signup"
  },
  {
    id: "c-corps",
    type: "deadline",
    title: "C Corporations",
    subtitle: "Form 1120",
    icon: Factory,
    color: "from-orange-500 to-amber-400",
    deadline: "April 15, 2026",
    extension: "October 15, 2026",
    headline: "Corporate Filing Made Simple",
    description: "C Corp taxes can be complex, but they don't have to be stressful. We handle the details while keeping you informed every step of the way.",
    note: "Remember: Taxes owed are still due April 15, even with an extension.",
    testimonial: {
      quote: "Finally, a team that explains things in plain English.",
      author: "Michael R., Manufacturing CEO"
    },
    cta: "Schedule Your Review",
    ctaAction: "signup"
  },
  {
    id: "individuals",
    type: "deadline",
    title: "Individuals & Sole Props",
    subtitle: "Form 1040 + Schedule C",
    icon: User,
    color: "from-emerald-500 to-teal-400",
    deadline: "April 15, 2026",
    extension: "October 15, 2026",
    headline: "Personal Taxes, Professional Care",
    description: "Whether you're a independent contractor, consultant, or have a consulting practice, your Schedule C gets the same attention we give to our biggest clients.",
    note: "Schedule C doesn't change your filing deadline—plan accordingly!",
    testimonial: {
      quote: "I went from dreading tax season to actually feeling prepared.",
      author: "Jordan T., Freelance Designer"
    },
    cta: "Start Your Return",
    ctaAction: "signup"
  },
  {
    id: "nonprofits",
    type: "deadline",
    title: "Nonprofits",
    subtitle: "Form 990 / 990-EZ / 990-N",
    icon: Heart,
    color: "from-rose-500 to-red-400",
    deadline: "May 15, 2026",
    extension: "November 15, 2026",
    headline: "Protect Your Mission",
    description: "Your Form 990 is more than compliance—it's transparency. We help nonprofits maintain good standing so they can keep doing great work.",
    note: "Calendar-year organizations: This is your deadline.",
    testimonial: {
      quote: "They understand nonprofits. That makes all the difference.",
      author: "Lisa M., Executive Director"
    },
    cta: "Secure Your Filing",
    ctaAction: "signup"
  },
  {
    id: "final-cta",
    type: "cta",
    title: "You're Ready",
    icon: Sparkles,
    color: "from-primary to-accent",
    headline: "File with a Team That Cares",
    description: "Join the businesses and nonprofits who trust Virtual OPS Hub for stress-free tax seasons and year-round compliance.",
    services: [
      { icon: BookOpen, text: "Bookkeeping & Cleanup" },
      { icon: DollarSign, text: "Payroll & W-2s" },
      { icon: Shield, text: "Business Compliance" },
      { icon: FileText, text: "Form 990 Support" },
      { icon: CheckCircle2, text: "Tax-Ready Financials" }
    ],
    cta: "Get Started Today",
    ctaAction: "signup"
  }
];

export default function TaxSeason2026() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = taxSlides.length;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const CALENDLY_URL = "https://calendly.com/vops";
  
  const handleCTA = (action: string) => {
    if (action === "next") {
      nextSlide();
    } else if (action === "signup") {
      window.open(CALENDLY_URL, "_blank");
    }
  };

  const currentSlideData = taxSlides[currentSlide];

  return (
    <>
      <Helmet>
        <title>2026 Tax Deadlines & Filing Guide | Virtual OPS Hub</title>
        <meta name="description" content="Don't miss a deadline. 2026 tax filing dates for S Corps (March 15), C Corps (April 15), individuals, and nonprofits (May 15). 500+ businesses trust us for stress-free filing. Start now." />
        
        {/* Open Graph - Optimized for shares */}
        <meta property="og:title" content="📅 2026 Tax Deadlines You Can't Miss" />
        <meta property="og:description" content="S Corps: March 15 • C Corps: April 15 • Nonprofits: May 15. Get organized with our free deadline guide. Trusted by 500+ businesses." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://virtualopsassist.com/tax-season-2026" />
        <meta property="og:image" content="https://virtualopsassist.com/og-tax-2026.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Virtual OPS Hub" />
        
        {/* Twitter Card - Action-oriented */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="📅 2026 Tax Deadlines You Can't Miss" />
        <meta name="twitter:description" content="S Corps: March 15 • C Corps: April 15 • Nonprofits: May 15. Free deadline guide from Virtual OPS Hub." />
        <meta name="twitter:image" content="https://virtualopsassist.com/og-tax-2026.png" />
        
        {/* SEO Keywords - Long-tail targeting */}
        <meta name="keywords" content="2026 tax deadlines, when are business taxes due 2026, S Corp filing deadline March 2026, C Corp tax deadline April 2026, nonprofit Form 990 deadline, tax extension deadlines 2026, consulting firm, contracting business, or nonprofit tax preparation, partnership tax filing" />
        <link rel="canonical" href="https://virtualopsassist.com/tax-season-2026" />
        
        {/* Article-specific schema */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "2026 Tax Season: Complete Filing Deadlines Guide",
            "description": "Know your 2026 tax deadlines for partnerships, S Corps, C Corps, individuals, and nonprofits.",
            "author": {"@type": "Organization", "name": "Virtual OPS Hub"},
            "publisher": {"@type": "Organization", "name": "Virtual OPS Hub"},
            "datePublished": "2025-12-01",
            "dateModified": "2026-01-14"
          }
        `}</script>
      </Helmet>
      
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">Virtual OPS Hub</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden sm:flex">
              Home
            </Button>
            <Button size="sm" onClick={() => window.open("https://calendly.com/vops", "_blank")} className="glow-primary-sm text-sm sm:text-base">
              Schedule a Call
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Page Theme Toggle */}
      <div className="fixed top-20 right-4 z-40">
        <PageThemeToggle className="px-0 py-0" />
      </div>

      {/* Main Carousel Section */}
      <section className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-card/80 border border-border hover:bg-card hover:border-primary/30 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-card/80 border border-border hover:bg-card hover:border-primary/30 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>

            {/* Slides */}
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {taxSlides.map((slide, index) => (
                  <div key={slide.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass gradient-border rounded-2xl p-6 sm:p-8 md:p-10 min-h-[550px] sm:min-h-[500px] flex flex-col"
                    >
                      {/* Slide Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-lg`}>
                            <slide.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{slide.title}</h2>
                            {slide.subtitle && (
                              <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Deadline Badge */}
                        {slide.type === "deadline" && slide.deadline && (
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">File By</span>
                            <span className="text-lg font-bold text-primary">{slide.deadline}</span>
                            {getDaysUntil(slide.deadline) > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {getDaysUntil(slide.deadline)} days remaining
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Slide Content */}
                      <div className="flex-1 flex flex-col">
                        {/* Headline */}
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                          {slide.headline}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-base sm:text-lg text-muted-foreground mb-6">
                          {slide.description}
                        </p>

                        {/* Type-specific content */}
                        {slide.type === "intro" && slide.stats && (
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {slide.stats.map((stat, i) => (
                              <div key={i} className="text-center p-4 rounded-xl bg-secondary/50">
                                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {slide.type === "info" && slide.items && (
                          <div className="space-y-3 mb-6">
                            {slide.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-foreground">{item.date}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.badge}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            ))}
                            {slide.tip && (
                              <p className="text-sm text-primary font-medium mt-4">{slide.tip}</p>
                            )}
                          </div>
                        )}

                        {slide.type === "deadline" && (
                          <div className="space-y-4 mb-6">
                            {/* Mobile deadline display */}
                            <div className="sm:hidden flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                              <Calendar className="w-5 h-5 text-primary shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">File by:</p>
                                <p className="text-xl font-bold text-foreground">{slide.deadline}</p>
                                {getDaysUntil(slide.deadline!) > 0 && (
                                  <p className="text-xs text-primary">{getDaysUntil(slide.deadline!)} days remaining</p>
                                )}
                              </div>
                            </div>

                            {/* Extension info */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                              <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">Extension available until:</p>
                                <p className="text-lg font-semibold text-foreground">{slide.extension}</p>
                              </div>
                            </div>

                            {/* Note */}
                            {slide.note && (
                              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
                                <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground">{slide.note}</p>
                              </div>
                            )}

                            {/* Testimonial */}
                            {slide.testimonial && (
                              <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                  ))}
                                </div>
                                <p className="text-sm italic text-foreground mb-2">"{slide.testimonial.quote}"</p>
                                <p className="text-xs text-muted-foreground">— {slide.testimonial.author}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {slide.type === "cta" && slide.services && (
                          <div className="mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                              {slide.services.map((service, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                                  <service.icon className="w-5 h-5 text-primary shrink-0" />
                                  <span className="text-sm font-medium text-foreground">{service.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>Built for independent professionals, nonprofits, and founders who value peace of mind.</span>
                            </div>
                          </div>
                        )}

                        {/* CTA Button - Always at bottom */}
                        <div className="mt-auto pt-4">
                          <Button 
                            size="lg" 
                            onClick={() => handleCTA(slide.ctaAction || "signup")} 
                            className="glow-primary text-base sm:text-lg px-8 h-12 sm:h-14 w-full sm:w-auto"
                          >
                            {slide.cta}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSlide 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              {currentSlide + 1} of {totalSlides}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              2026 Filing Deadlines at a Glance
            </h2>
            <p className="text-muted-foreground">
              Save this page—we'll help you stay on track
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {taxSlides
              .filter((s): s is typeof s & { deadline: string; extension: string } => s.type === "deadline")
              .map((slide, index) => {
                const daysLeft = getDaysUntil(slide.deadline);
                return (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-5 border border-border hover:border-primary/30 transition-all group cursor-pointer"
                    onClick={() => navigate("/auth?mode=signup")}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${slide.color} flex items-center justify-center`}>
                        <slide.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{slide.title}</h3>
                        <p className="text-xs text-muted-foreground">{slide.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File by:</span>
                        <span className="font-semibold text-foreground">{slide.deadline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Extension:</span>
                        <span className="text-muted-foreground">{slide.extension}</span>
                      </div>
                    </div>

                    {daysLeft > 0 && (
                      <div className="text-center py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        {daysLeft} days to prepare
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      Click to get started →
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Trusted by 500+ Businesses</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
              Ready When You Are
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're filing early or need an extension, our team is here to help you every step of the way. No pressure—just reliable support.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?mode=signup")} 
                className="glow-primary text-lg px-8 h-14 w-full sm:w-auto"
              >
                Start Your 2026 Filing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="text-lg px-8 h-14 w-full sm:w-auto"
              >
                Learn About Our Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Virtual OPS Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
              Home
            </button>
            <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

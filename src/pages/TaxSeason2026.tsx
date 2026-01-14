import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Calendar,
  Building2,
  Factory,
  User,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Zap,
  BookOpen,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Tax deadline data
const taxDeadlines = [
  {
    id: "irs-opens",
    title: "IRS E-File Opening Dates",
    icon: Calendar,
    color: "from-blue-500 to-cyan-400",
    items: [
      { date: "January 13, 2026", time: "9 a.m. ET", description: "Business returns & Nonprofit returns" },
      { date: "January 26, 2026", description: "Individual tax returns (Form 1040)" }
    ],
    warning: "IRS systems shut down for maintenance starting Dec 26, 2025"
  },
  {
    id: "partnerships",
    title: "Partnerships & S Corps",
    subtitle: "Form 1065 & 1120-S",
    icon: Building2,
    color: "from-purple-500 to-pink-400",
    deadline: "March 15, 2026",
    extension: "September 15, 2026",
    note: "Multi-member LLCs file here"
  },
  {
    id: "c-corps",
    title: "C Corporations",
    subtitle: "Form 1120",
    icon: Factory,
    color: "from-orange-500 to-amber-400",
    deadline: "April 15, 2026",
    extension: "October 15, 2026",
    note: "Taxes owed are still due by April 15"
  },
  {
    id: "individuals",
    title: "Individuals & Sole Proprietors",
    subtitle: "Form 1040 + Schedule C",
    icon: User,
    color: "from-emerald-500 to-teal-400",
    deadline: "April 15, 2026",
    extension: "October 15, 2026",
    note: "Schedule C does not change your deadline"
  },
  {
    id: "nonprofits",
    title: "Nonprofits (Calendar-Year)",
    subtitle: "Form 990 / 990-EZ / 990-N",
    icon: Heart,
    color: "from-rose-500 to-red-400",
    deadline: "May 15, 2026",
    extension: "November 15, 2026",
    note: "Missing this can risk penalties or status issues"
  }
];

// Services offered
const services = [
  { icon: BookOpen, text: "Bookkeeping & cleanup" },
  { icon: DollarSign, text: "Payroll & W-2s" },
  { icon: Shield, text: "Business & nonprofit compliance" },
  { icon: FileText, text: "Form 990 support" },
  { icon: CheckCircle2, text: "Tax-ready financials" }
];

export default function TaxSeason2026() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = taxDeadlines.length + 1; // +1 for CTA slide

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
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
            <Button size="sm" onClick={() => navigate("/auth?mode=signup")} className="glow-primary-sm text-sm sm:text-base">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-medium">2026 Tax Season</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              What Opens & When to File
              <span className="text-gradient block mt-1 sm:mt-2">For 2025 Income</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
              Businesses • Nonprofits • Individuals
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>👉 Swipe through to stay compliant</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 border border-border hover:bg-card transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 border border-border hover:bg-card transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>

            {/* Slides */}
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Tax Deadline Slides */}
                {taxDeadlines.map((deadline, index) => (
                  <div key={deadline.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass gradient-border rounded-2xl p-6 sm:p-8 md:p-10 min-h-[400px] flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${deadline.color} flex items-center justify-center`}>
                          <deadline.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{deadline.title}</h2>
                          {deadline.subtitle && (
                            <p className="text-sm text-muted-foreground">({deadline.subtitle})</p>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {deadline.items ? (
                          // IRS Opening dates format
                          <>
                            {deadline.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                                <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {item.date} {item.time && <span className="text-primary">({item.time})</span>}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            ))}
                            {deadline.warning && (
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                                <p className="text-sm text-destructive">{deadline.warning}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          // Standard deadline format
                          <>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                              <Calendar className="w-5 h-5 text-primary shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">File by:</p>
                                <p className="text-xl font-bold text-foreground">{deadline.deadline}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                              <Clock className="w-5 h-5 text-primary shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">Extension deadline:</p>
                                <p className="text-xl font-bold text-foreground">{deadline.extension}</p>
                              </div>
                            </div>
                            {deadline.note && (
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground">{deadline.note}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}

                {/* CTA Slide */}
                <div className="w-full flex-shrink-0 px-2 sm:px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass gradient-border rounded-2xl p-6 sm:p-8 md:p-10 min-h-[400px] flex flex-col"
                  >
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                        Don't Just File — Stay Compliant All Year
                      </h2>

                      <p className="text-muted-foreground mb-6 max-w-lg">
                        Virtual OPS Hub helps you with:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full max-w-md">
                        {services.map((service, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                            <service.icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm text-foreground">{service.text}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground mb-6">
                        💼 Built for entrepreneurs, nonprofits, and founders who want peace of mind.
                      </p>

                      <Button 
                        size="lg" 
                        onClick={() => navigate("/auth?mode=signup")} 
                        className="glow-primary text-base sm:text-lg px-8 h-14"
                      >
                        Get Organized Before Deadlines Hit
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide 
                      ? "w-8 bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Quick Reference: All 2026 Deadlines
            </h2>
            <p className="text-muted-foreground">
              Bookmark this page to stay on track
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {taxDeadlines.filter(d => d.deadline).map((deadline, index) => (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-5 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${deadline.color} flex items-center justify-center`}>
                    <deadline.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{deadline.title}</h3>
                    <p className="text-xs text-muted-foreground">{deadline.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File by:</span>
                    <span className="font-semibold text-foreground">{deadline.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extension:</span>
                    <span className="font-semibold text-foreground">{deadline.extension}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
              Ready to Get Tax-Ready?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Join entrepreneurs and nonprofits who trust Virtual OPS Hub for year-round compliance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth?mode=signup")} 
                className="glow-primary text-lg px-8 h-14 w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="text-lg px-8 h-14 w-full sm:w-auto"
              >
                Learn More About Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Virtual OPS Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Virtual OPS Hub. All rights reserved.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">#VirtualOPSHub</span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">#TaxSeason2026</span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">#NonprofitCompliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

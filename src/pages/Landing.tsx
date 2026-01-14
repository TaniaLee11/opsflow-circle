import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight, 
  Zap, 
  Users, 
  Building2, 
  Target,
  TrendingUp,
  Shield,
  CheckCircle2,
  Layers,
  BarChart3,
  Clock,
  Heart,
  Rocket,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

// Operating paths for path selection
const operatingPaths = [
  {
    id: "building",
    title: "Building Something New",
    description: "Starting a venture, launching a project, or creating from scratch",
    icon: Rocket,
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: "running",
    title: "Running Operations",
    description: "Managing day-to-day business, clients, and ongoing workflows",
    icon: Zap,
    color: "from-primary to-orange-400"
  },
  {
    id: "managing",
    title: "Managing a Mission",
    description: "Leading an organization with a purpose beyond profit",
    icon: Heart,
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: "growing",
    title: "Scaling & Growing",
    description: "Expanding what works, adding team members, or entering new markets",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-400"
  }
];

// Audience identities
const audienceIdentities = [
  {
    title: "You carry income responsibility",
    description: "Whether for yourself, your family, or your organization—you're accountable for generating and managing revenue."
  },
  {
    title: "You operate independently",
    description: "You make decisions, set direction, and own the outcomes of your work without waiting for permission."
  },
  {
    title: "You wear multiple hats",
    description: "Finance, operations, compliance, strategy—you handle it all or need to understand it all."
  },
  {
    title: "You're building something real",
    description: "Not just a side project—a business, organization, or mission that matters."
  }
];

// Differentiation points
const differentiators = [
  {
    title: "Not just accounting",
    description: "We go beyond bookkeeping to integrate operations, compliance, and strategy."
  },
  {
    title: "Not just project management",
    description: "We connect your workflows to financial outcomes and operational visibility."
  },
  {
    title: "Not limited to one structure",
    description: "Whether for-profit, nonprofit, or hybrid—the platform adapts to how you operate."
  }
];

const CALENDLY_URL = "https://calendly.com/vops";

export default function Landing() {
  const navigate = useNavigate();

  const handleScheduleCall = () => {
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Virtual OPS Assist | Accounting, Bookkeeping & Financial Services</title>
        <meta name="description" content="Expert bookkeeping, tax preparation, compliance, and CFO advisory services for entrepreneurs, nonprofits, and growing businesses. 500+ businesses served. Start free today." />
        <meta property="og:title" content="Accounting & Financial Services That Actually Move You Forward" />
        <meta property="og:description" content="Full-cycle bookkeeping, tax prep, compliance, and strategic advisory. Built for businesses that do it all. Trusted by 500+ organizations." />
        <meta property="og:image" content="https://virtualopsassist.com/og-home.png" />
        <meta property="og:url" content="https://virtualopsassist.com/" />
        <meta name="twitter:title" content="Accounting & Financial Services That Actually Move You Forward" />
        <meta name="twitter:description" content="Full-cycle bookkeeping, tax prep, compliance, and strategic advisory. Trusted by 500+ organizations." />
        <meta name="twitter:image" content="https://virtualopsassist.com/og-home.png" />
        <link rel="canonical" href="https://virtualopsassist.com/" />
      </Helmet>
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-medium">Trusted by 500+ Businesses & Nonprofits</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Accounting & Financial Services
              <span className="text-gradient block mt-1 sm:mt-2">That Actually Move You Forward.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
              Full-cycle bookkeeping, tax preparation, compliance, CFO advisory, and operations support—
              delivered by real professionals, backed by smart systems.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Button size="lg" onClick={() => navigate("/hub")} className="glow-primary text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto">
                See How It Works
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 sm:mt-12 md:mt-16 relative px-2"
          >
            <div className="glass gradient-border rounded-xl sm:rounded-2xl p-2 sm:p-4 max-w-4xl mx-auto">
              <div className="bg-card rounded-lg sm:rounded-xl p-3 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 border-b border-border pb-3 sm:pb-4">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive/50" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-warning/50" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "Cash Flow", value: "$24,580", icon: BarChart3, change: "+12%" },
                    { label: "Active Tasks", value: "18", icon: CheckCircle2, change: "4 due today" },
                    { label: "Compliance", value: "98%", icon: Shield, change: "On track" }
                  ].map((metric, i) => (
                    <div key={i} className="p-3 sm:p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
                        <metric.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {metric.label}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-xs text-primary mt-0.5 sm:mt-1">{metric.change}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Audience Recognition Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              Built for People Who Own the Outcome
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              You don't fit in a box—and neither should your operating system.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {audienceIdentities.map((identity, index) => (
              <motion.div
                key={identity.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass gradient-border rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4"
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{identity.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{identity.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Path Selection Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              Choose Your Starting Point
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Every journey is different. Select what resonates with where you are right now.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {operatingPaths.map((path, index) => (
              <motion.button
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => navigate("/hub")}
                className="glass rounded-xl p-4 sm:p-6 text-left group hover:glow-primary-sm transition-all border border-border hover:border-primary/50"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-3 sm:mb-4`}>
                  <path.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors">
                  {path.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{path.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Growth & Scalability Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                Evolve Without Starting Over
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Your needs will change. You'll grow, pivot, add team members, or shift focus. 
                The platform adapts with you—so you never have to rebuild from scratch.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: Layers, text: "Upgrade tiers as you scale" },
                  { icon: Users, text: "Add team members when ready" },
                  { icon: Building2, text: "Manage multiple entities from one place" },
                  { icon: Clock, text: "Access support when you need it" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass gradient-border rounded-xl sm:rounded-2xl p-5 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm text-muted-foreground">Growth Path</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {["AI Free", "AI Assistant", "AI Operations", "AI Advisory", "AI Enterprise"].map((tier, i) => (
                  <div key={tier} className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm sm:text-base ${i === 2 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {tier}
                    </span>
                    {i === 2 && (
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary">
                        Most Popular
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              An Integrated Operating System
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              We're not a single-purpose tool. We're the foundation you run your operations on.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {differentiators.map((diff, index) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-4 sm:p-6 text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2">{diff.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{diff.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-4">
              You Don't Need Everything Figured Out
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 px-4">
              Start where you are. The platform will guide you, adapt with you, and grow with you.
            </p>
            <Button size="lg" onClick={() => navigate("/hub")} className="glow-primary text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 w-full sm:w-auto max-w-xs mx-auto">
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
              No credit card required • Free tier always available
            </p>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
    </>
  );
}

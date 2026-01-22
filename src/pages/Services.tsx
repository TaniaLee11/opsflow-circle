import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight,
  Calculator,
  FileCheck,
  Clock,
  Users,
  Bot,
  Briefcase,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Building2,
  GraduationCap,
  Cog,
  Shield,
  DollarSign,
  ExternalLink,
  Sparkles,
  Zap,
  Crown,
  HeartHandshake,
  Receipt,
  ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

const CALENDLY_URL = "https://calendly.com/vops";

const serviceCategories = [
  {
    icon: Calculator,
    title: "Accounting & Bookkeeping",
    tagline: "Always tax-ready. Always clear.",
    description: "Full-cycle financial organization that keeps your books clean and your mind at ease.",
    features: [
      "Full-cycle bookkeeping (monthly, quarterly, annual)",
      "Transaction categorization & reconciliation",
      "Chart of Accounts setup & optimization",
      "Cleanup and catch-up bookkeeping",
      "Multi-account reconciliation (bank, credit cards, loans)",
      "Job-costing & project-based accounting",
      "Accrual and cash-basis accounting"
    ]
  },
  {
    icon: TrendingUp,
    title: "Financial Reporting & Analysis",
    tagline: "Know where you stand—always.",
    description: "Clear, actionable reports that tell the story of your business finances.",
    features: [
      "Profit & Loss (Income Statements)",
      "Balance Sheets & Cash Flow Statements",
      "Budget vs. Actual reports",
      "Financial dashboards",
      "Financial health assessments",
      "Management reports for leadership & boards",
      "Grant and donor financial reporting (nonprofits)"
    ]
  },
  {
    icon: FileCheck,
    title: "Tax & Compliance Support",
    tagline: "Deadlines handled. No surprises.",
    description: "Proactive compliance management so you're never scrambling at the last minute.",
    features: [
      "Sales tax tracking & reporting",
      "Payroll tax preparation support",
      "1099 contractor tracking & filing support",
      "Expense documentation & audit readiness",
      "Compliance calendars & filing reminders",
      "Coordination with CPAs & tax preparers",
      "IRS notice support & documentation prep"
    ]
  },
  {
    icon: Users,
    title: "Payroll & Contractor Management",
    tagline: "Your people, handled right.",
    description: "Streamlined payroll and contractor administration that keeps you compliant.",
    features: [
      "Payroll setup & processing support",
      "Payroll reconciliation",
      "Contractor onboarding (W-9 collection, tracking)",
      "Payroll compliance review",
      "Labor cost tracking",
      "Multi-state payroll coordination support"
    ]
  },
  {
    icon: DollarSign,
    title: "Cash Flow & Budgeting",
    tagline: "Plan ahead. Breathe easier.",
    description: "Strategic financial planning that gives you visibility and control.",
    features: [
      "Cash flow forecasting",
      "Budget creation & monitoring",
      "Break-even analysis",
      "Runway and burn-rate analysis",
      "Seasonal revenue planning",
      "Expense reduction & optimization strategies"
    ]
  },
  {
    icon: Cog,
    title: "Business Setup & Financial Infrastructure",
    tagline: "Build it right from the start.",
    description: "Financial foundations for startups and growing businesses.",
    features: [
      "Financial system setup for startups",
      "Accounting software setup (QuickBooks, Wave, etc.)",
      "Business entity financial onboarding",
      "Internal financial controls design",
      "SOP creation for financial workflows",
      "Separation of personal vs. business finances"
    ]
  },
  {
    icon: Building2,
    title: "Nonprofit Financial Management",
    tagline: "Mission-focused. Compliance-ready.",
    description: "Specialized support for organizations making a difference.",
    features: [
      "Grant budgeting & tracking",
      "Restricted vs. unrestricted fund tracking",
      "Board-ready financial statements",
      "Compliance support for 501(c)(3)s",
      "Program-level financial reporting",
      "Fiscal sponsor reporting support"
    ]
  },
  {
    icon: Briefcase,
    title: "Fractional CFO & Advisory",
    tagline: "Expert guidance, when you need it.",
    description: "Strategic financial leadership without the full-time cost.",
    features: [
      "Strategic financial planning",
      "Growth readiness assessments",
      "Funding preparation (debt & equity)",
      "Investor-ready financials",
      "Pricing & revenue model analysis",
      "Financial coaching for founders & executives"
    ]
  },
  {
    icon: Clock,
    title: "Operational & Administrative Support",
    tagline: "The back-office you deserve.",
    description: "Day-to-day operations management that keeps everything running smoothly.",
    features: [
      "Back-office operations management",
      "Vendor payment workflows",
      "Invoicing and AR/AP management",
      "Contract financial reviews",
      "Internal reporting systems",
      "Documentation & records management"
    ]
  },
  {
    icon: GraduationCap,
    title: "Education & Training",
    tagline: "Knowledge is power.",
    description: "Build financial confidence through education tailored to your needs.",
    features: [
      "Financial literacy training for founders",
      "Budgeting & cash-flow workshops",
      "Nonprofit finance training",
      "Entrepreneur bootcamp instruction",
      "One-on-one financial coaching",
      "Group financial trainings & workshops"
    ]
  },
  {
    icon: Bot,
    title: "Technology & Automation",
    tagline: "Smart systems. Less manual work.",
    description: "Leverage technology to streamline your financial operations.",
    features: [
      "Accounting software integrations",
      "Spreadsheet-driven financial models",
      "Workflow automation consulting",
      "CRM + accounting alignment",
      "Reporting automation setup",
      "Tool evaluation & selection advisory"
    ]
  }
];

// Unified 7 tiers - Platform-led (AI Free, Assistant, Operations) vs Human-led (Advisory, Tax, Compliance, Enterprise)
// EXECUTION MODEL:
// - AI Free: Guidance only (no integrations, no execution)
// - AI Assistant: Read access, advisory only (no execution)
// - AI Operations: Full execution authority (read, write, execute)
// - AI Advisory, AI Compliance, AI Enterprise: Mirror AI Operations + human expertise
// - AI Tax: Human-led service with read access (no execution)
const tiers = [
  {
    id: "free",
    name: "AI Free",
    icon: Sparkles,
    price: "Free",
    description: "AI-powered guidance and education built on years of accounting expertise",
    features: [
      "VOPSy AI chat & guidance",
      "Document discussion & upload",
      "Educational resources",
      "Financial literacy tools",
      "Community support"
    ],
    accessNote: "Guidance only — no integrations",
    cta: "Start Free",
    type: "platform", // Routes to Hub signup
    highlight: false
  },
  {
    id: "ai_assistant",
    name: "AI Assistant",
    icon: Bot,
    price: "$39.99",
    period: "/month",
    description: "Read-only access to connected tools with intelligent analysis and recommendations",
    features: [
      "Everything in AI Free",
      "Connect bank, email & calendars",
      "Read & analyze your data",
      "Smart recommendations",
      "Financial insights"
    ],
    accessNote: "Read access — advisory only",
    cta: "Get Started",
    type: "platform",
    highlight: false
  },
  {
    id: "ai_operations",
    name: "AI Operations",
    icon: Zap,
    price: "$99.99",
    period: "/month",
    description: "Full execution authority — VOPSy works on your behalf",
    features: [
      "Everything in AI Assistant",
      "VOPSy executes tasks for you",
      "Automated workflows",
      "Write & modify data",
      "Reconciliation & organization"
    ],
    accessNote: "Full execution — read, write & automate",
    cta: "Most Popular",
    type: "platform",
    highlight: true,
    popular: true
  },
  {
    id: "ai_advisory",
    name: "AI Advisory",
    icon: HeartHandshake,
    price: "$150",
    period: "/hour",
    priceNote: "$125/hour for nonprofits",
    description: "Strategic guidance from Tanya Potter with full platform execution",
    features: [
      "One-on-one advisory sessions",
      "Strategic financial planning",
      "Growth readiness assessments",
      "Fractional CFO services",
      "Full AI Operations access"
    ],
    accessNote: "Human-led + full execution",
    cta: "Schedule Consultation",
    type: "human",
    highlight: false
  },
  {
    id: "ai_tax",
    name: "AI Tax",
    icon: Receipt,
    price: "From $125",
    priceNote: "Personal $125 • Personal w/Business $175 • Business $250",
    description: "Professional tax preparation with expert human review",
    features: [
      "Personal & business returns",
      "Expert tax preparation",
      "IRS notice support",
      "Year-round tax planning",
      "AI Free platform access"
    ],
    accessNote: "Human-led + guidance platform",
    cta: "Schedule Tax Review",
    type: "human",
    highlight: false
  },
  {
    id: "ai_compliance",
    name: "AI Compliance",
    icon: ClipboardCheck,
    price: "$350",
    period: "/quarter",
    priceNote: "Plus cost of returns",
    description: "Ongoing compliance management with dedicated support and full execution",
    features: [
      "Quarterly compliance review",
      "Filing deadline management",
      "Sales tax tracking",
      "1099 contractor management",
      "Full AI Operations access"
    ],
    accessNote: "Human-led + full execution",
    cta: "Schedule Compliance Call",
    type: "human",
    highlight: false
  },
  {
    id: "ai_enterprise",
    name: "AI Enterprise",
    icon: Crown,
    price: "$499–$999",
    period: "/month",
    description: "Custom solutions with dedicated account manager and full execution authority",
    features: [
      "Dedicated account manager",
      "Custom integrations",
      "White-glove onboarding",
      "Multi-user access",
      "Full AI Operations access"
    ],
    accessNote: "Human-led + full execution + custom",
    cta: "Contact Us",
    type: "human",
    highlight: false
  }
];

const industriesServed = [
  "Startups & early-stage founders",
  "Nonprofits & faith-based organizations",
  "Contractors & construction businesses",
  "Gig workers & independent contractors",
  "Women-owned businesses",
  "Minority-owned businesses",
  "SMEs seeking growth capital",
  "International & Africa-based SMEs"
];

export default function Services() {
  const navigate = useNavigate();
  
  const handleTierSelect = (tier: typeof tiers[0]) => {
    if (tier.type === "platform") {
      // Platform-led tiers route to Hub signup
      navigate("/tier-selection");
    } else {
      // Human-led tiers route to Calendly
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleScheduleCall = () => {
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Services | Virtual OPS Assist - Bookkeeping, Compliance & Operations</title>
        <meta name="description" content="Expert bookkeeping, tax preparation, compliance support, CFO advisory, and operations management for entrepreneurs, nonprofits, and growing businesses. Get organized, stay compliant, and grow with confidence." />
        <link rel="canonical" href="https://virtualopsassist.com/services" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <PublicNav />

        {/* Hero */}
        <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Accounting & Financial Services 
                <span className="text-gradient block">That Actually Move You Forward</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Expert bookkeeping, tax preparation, compliance, CFO advisory, and operations support—
                delivered by real professionals, backed by smart systems.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={handleScheduleCall} className="glow-primary text-lg px-8 h-14">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule a Call
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Choose Your Path - Pricing Section */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Choose Your Path
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Whether you prefer AI-powered tools or hands-on expert guidance, we have the right fit for you.
              </p>
            </motion.div>

            {/* Platform-led vs Human-led explanation */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 border-l-4 border-primary"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Bot className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">AI-Powered Platform</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>AI Free, AI Assistant & AI Operations</strong> — Self-service tools built on years of accounting expertise.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>AI Free:</strong> Guidance & education only</li>
                  <li>• <strong>AI Assistant:</strong> Read access + recommendations</li>
                  <li>• <strong>AI Operations:</strong> Full execution authority</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 border-l-4 border-accent"
              >
                <div className="flex items-center gap-3 mb-3">
                  <HeartHandshake className="w-6 h-6 text-accent" />
                  <h3 className="font-semibold text-foreground">Human-Led Services</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>AI Advisory, AI Tax, AI Compliance & AI Enterprise</strong> — Work directly with Tanya Potter and her team.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>AI Tax:</strong> Human-led + AI Free platform</li>
                  <li>• <strong>Advisory, Compliance, Enterprise:</strong> Human-led + full execution</li>
                </ul>
              </motion.div>
            </div>

            {/* Tier Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass rounded-2xl p-6 relative flex flex-col ${
                    tier.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                  } ${tier.type === 'human' ? 'bg-accent/5' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className={`absolute top-4 right-4 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    tier.type === 'platform' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-accent/20 text-accent-foreground'
                  }`}>
                    {tier.type === 'platform' ? 'Platform' : 'Human-Led'}
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <tier.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-foreground">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
                    </div>
                    {tier.priceNote && (
                      <p className="text-xs text-muted-foreground mt-1">{tier.priceNote}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{tier.description}</p>
                    {tier.accessNote && (
                      <p className={`text-[10px] mt-2 px-2 py-1 rounded-full inline-block ${
                        tier.id === 'ai_operations' || tier.id === 'ai_advisory' || tier.id === 'ai_compliance' || tier.id === 'ai_enterprise'
                          ? 'bg-success/20 text-success'
                          : tier.id === 'ai_assistant'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {tier.accessNote}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleTierSelect(tier)}
                    className={`w-full ${tier.popular ? 'glow-primary' : ''}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                    {tier.type === 'human' && <ExternalLink className="w-3 h-3 ml-2" />}
                    {tier.type === 'platform' && <ArrowRight className="w-3 h-3 ml-2" />}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Comprehensive Financial & Operations Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From day-to-day bookkeeping to strategic advisory—we handle the full spectrum.
              </p>
            </motion.div>

            <div className="space-y-8">
              {serviceCategories.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass gradient-border rounded-2xl p-6 sm:p-8"
                >
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                          <p className="text-sm text-primary">{service.tagline}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Served */}
        <section className="py-16 px-4 sm:px-6 bg-card/50 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Industries We Serve
              </h2>
              <p className="text-muted-foreground">
                Experience across diverse sectors and business types.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {industriesServed.map((industry, index) => (
                <motion.div
                  key={industry}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-background/50"
                >
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{industry}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Not Sure Where to Start - CTA */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Not Sure Where to Start?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Let's talk about your needs and find the right fit. No pressure, no commitment—
                just a conversation about where you are and how we can help.
              </p>
              <Button size="lg" onClick={handleScheduleCall} className="glow-primary text-lg px-10 h-14">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule a Free Consultation
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight,
  Calculator,
  FileCheck,
  Clock,
  Users,
  Bot,
  Briefcase,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

const services = [
  {
    icon: Calculator,
    title: "Bookkeeping & Financial Organization",
    tagline: "Always tax-ready. Always clear.",
    description: "Monthly reconciliation, expense categorization, cash flow tracking, and financial reporting that actually makes sense.",
    features: [
      "Bank & credit card reconciliation",
      "Expense categorization & tracking",
      "Monthly financial statements",
      "Cash flow forecasting"
    ]
  },
  {
    icon: FileCheck,
    title: "Compliance & Filings",
    tagline: "Deadlines handled. No last-minute stress.",
    description: "We track, prepare, and file—so you never miss a deadline or wonder if you're compliant.",
    features: [
      "Tax preparation & filing",
      "Quarterly estimates",
      "State & federal compliance",
      "Nonprofit regulatory filings"
    ]
  },
  {
    icon: Clock,
    title: "Ongoing Operations Support",
    tagline: "A real team—backed by systems.",
    description: "Day-to-day operational support that keeps your business running smoothly, month after month.",
    features: [
      "Dedicated support contact",
      "Workflow automation",
      "Document management",
      "Process optimization"
    ]
  },
  {
    icon: Bot,
    title: "AI-Powered Assistance",
    tagline: "Smart answers, anytime.",
    description: "VOPSy AI handles quick questions, generates reports, and automates routine tasks—24/7.",
    features: [
      "Instant Q&A support",
      "Report generation",
      "Task automation",
      "Proactive reminders"
    ]
  },
  {
    icon: Briefcase,
    title: "Advisory & Strategy",
    tagline: "Expert guidance for growth.",
    description: "Strategic planning, financial consulting, and expert advice for businesses ready to scale.",
    features: [
      "Business planning",
      "Financial strategy",
      "Growth roadmapping",
      "Entity structuring"
    ]
  }
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    description: "For those just getting organized",
    features: ["Basic AI support", "Document storage", "Educational resources"]
  },
  {
    name: "Essential",
    price: "$97",
    period: "/month",
    description: "For active businesses needing support",
    features: ["Monthly bookkeeping", "Compliance tracking", "AI assistant access", "Email support"],
    popular: true
  },
  {
    name: "Professional",
    price: "$297",
    period: "/month",
    description: "For growing businesses needing more",
    features: ["Everything in Essential", "Dedicated support", "Advisory calls", "Priority handling"]
  }
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Services | Virtual OPS Assist - Bookkeeping, Compliance & Operations</title>
        <meta name="description" content="Expert bookkeeping, compliance, tax preparation, and operations support for entrepreneurs and nonprofits. Get organized, stay compliant, and grow with confidence." />
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
                Services That Actually 
                <span className="text-gradient block">Move Your Business Forward</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Expert support for operations, finance, and compliance—so you can focus on what you do best.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass gradient-border rounded-2xl p-6 sm:p-8"
                >
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
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
                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
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

        {/* Pricing */}
        <section className="py-20 px-4 sm:px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the level of support that fits your needs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricing.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-2xl p-6 sm:p-8 relative ${
                    tier.popular ? 'border-2 border-primary' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => navigate("/auth?mode=signup")} 
                    className={`w-full ${tier.popular ? 'glow-primary' : ''}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
                Let's talk about your needs and find the right fit. No pressure, no commitment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate("/contact")} className="glow-primary text-lg px-8 h-14">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule a Call
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/hub")} className="text-lg px-8 h-14">
                  Learn About the Hub
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}

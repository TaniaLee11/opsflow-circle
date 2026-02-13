import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Shield,
  Star,
  Users,
  ArrowRight,
  Building2,
  User,
  Heart,
  Receipt,
  Zap,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";

const CALENDLY_URL = "https://calendly.com/vops";

// Key deadlines for 2026
const deadlines = [
  { entity: "Partnerships & S Corps", form: "1065 / 1120-S", date: "March 15, 2026", extension: "Sept 15" },
  { entity: "C Corporations", form: "1120", date: "April 15, 2026", extension: "Oct 15" },
  { entity: "Individuals", form: "1040 + Schedule C", date: "April 15, 2026", extension: "Oct 15" },
  { entity: "Nonprofits", form: "990 / 990-EZ", date: "May 15, 2026", extension: "Nov 15" },
];

// Tax service packages
const taxPackages = [
  {
    name: "Personal Return",
    price: "$125",
    description: "Individual tax preparation with expert review",
    includes: [
      "Form 1040 preparation",
      "Standard deductions analysis",
      "Tax credit optimization",
      "E-file submission",
      "IRS notice support"
    ],
    ideal: "W-2 employees, simple investments"
  },
  {
    name: "Personal + Business",
    price: "$175",
    description: "Personal return with Schedule C for side income",
    includes: [
      "Everything in Personal Return",
      "Schedule C (self-employment)",
      "Home office deductions",
      "Quarterly estimate guidance",
      "Business expense review"
    ],
    ideal: "Independent contractors, consultants, and contracting businesses",
    popular: true
  },
  {
    name: "Business Return",
    price: "$250",
    description: "Full business tax preparation and filing",
    includes: [
      "S Corp, C Corp, or Partnership returns",
      "Multi-state filing support",
      "K-1 preparation",
      "Payroll tax reconciliation",
      "Year-end tax planning"
    ],
    ideal: "LLCs, S Corps, partnerships"
  }
];

// What's included with all packages
const allIncluded = [
  { icon: Shield, text: "Accuracy guarantee" },
  { icon: Users, text: "Expert CPA review" },
  { icon: Clock, text: "Year-round support" },
  { icon: FileText, text: "Secure document portal" },
];

// Trust signals
const trustStats = [
  { value: "500+", label: "Returns Filed" },
  { value: "99.8%", label: "On-Time Rate" },
  { value: "12+", label: "Years Experience" },
];

export default function TaxServices() {
  const navigate = useNavigate();

  const handleScheduleCall = () => {
    window.open(CALENDLY_URL, "_blank");
  };

  return (
    <>
      <Helmet>
        <title>Tax Services 2026 | Virtual OPS Hub - Expert Tax Preparation</title>
        <meta name="description" content="Professional tax preparation starting at $125. Personal returns, business filing, and year-round support. 500+ returns filed with 99.8% on-time rate. Schedule your free consultation." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Tax Services 2026 | Expert Preparation from $125" />
        <meta property="og:description" content="Personal returns $125 • Business returns $250 • Year-round support included. Join 500+ clients who file stress-free with Virtual OPS Hub." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://virtualopsassist.com/tax-services" />
        <meta property="og:image" content="https://virtualopsassist.com/og-tax-2026.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tax Services 2026 | From $125" />
        <meta name="twitter:description" content="Expert tax preparation with year-round support. Personal $125 • Business $250. Schedule free consultation." />
        <meta name="twitter:image" content="https://virtualopsassist.com/og-tax-2026.png" />
        
        <meta name="keywords" content="tax preparation services, business tax filing, personal tax return, S Corp tax, C Corp filing, nonprofit 990, tax professional near me, affordable tax preparation" />
        <link rel="canonical" href="https://virtualopsassist.com/tax-services" />
        
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Tax Preparation Services",
            "provider": {"@type": "Organization", "name": "Virtual OPS Hub"},
            "description": "Professional tax preparation for individuals and businesses",
            "offers": [
              {"@type": "Offer", "name": "Personal Return", "price": "125", "priceCurrency": "USD"},
              {"@type": "Offer", "name": "Business Return", "price": "250", "priceCurrency": "USD"}
            ]
          }
        `}</script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <PublicNav />
        
        {/* Page Theme Toggle */}
        <div className="fixed top-20 right-4 z-40">
          <PageThemeToggle className="px-0 py-0" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">2026 Tax Season</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Tax Preparation
                <span className="text-gradient block">Made Simple</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Expert tax preparation starting at <strong className="text-foreground">$125</strong>. 
                Personal and business returns filed accurately, on time, every time.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button size="lg" onClick={handleScheduleCall} className="glow-primary text-lg px-8 h-14">
                  <Phone className="w-5 h-5 mr-2" />
                  Free Consultation
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/tax-season-2026")} className="text-lg px-8 h-14">
                  View Full Deadline Guide
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {trustStats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Deadlines Quick Reference */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">
                📅 2026 Filing Deadlines
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {deadlines.map((d, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {d.entity.includes("Partnership") && <Building2 className="w-5 h-5 text-primary" />}
                      {d.entity.includes("C Corp") && <Building2 className="w-5 h-5 text-primary" />}
                      {d.entity.includes("Individual") && <User className="w-5 h-5 text-primary" />}
                      {d.entity.includes("Nonprofit") && <Heart className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{d.entity}</p>
                      <p className="text-xs text-muted-foreground">{d.form}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{d.date.split(",")[0]}</p>
                      <p className="text-xs text-muted-foreground">Ext: {d.extension}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Packages */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No hidden fees. No surprises. Just expert tax preparation at fair prices.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {taxPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-2xl p-6 relative flex flex-col ${
                    pkg.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                    <div className="text-4xl font-bold text-primary mb-2">{pkg.price}</div>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Includes:</p>
                    <ul className="space-y-2 mb-6">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-4">
                      <strong>Ideal for:</strong> {pkg.ideal}
                    </p>
                    <Button 
                      onClick={handleScheduleCall} 
                      className={`w-full ${pkg.popular ? 'glow-primary' : ''}`}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* All Packages Include */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                All Packages Include
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {allIncluded.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 sm:px-6 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Why Clients Trust Us
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Receipt,
                  title: "No Surprise Fees",
                  description: "Clear pricing upfront. The price you see is the price you pay."
                },
                {
                  icon: Users,
                  title: "Expert Review",
                  description: "Every return is reviewed by experienced tax professionals."
                },
                {
                  icon: Clock,
                  title: "Year-Round Support",
                  description: "Got a question in July? We're here. IRS notice? We help."
                },
                {
                  icon: Zap,
                  title: "Fast Turnaround",
                  description: "Most returns completed within 5-7 business days."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-6 glass rounded-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 sm:p-10 text-center"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
              <blockquote className="text-xl sm:text-2xl font-medium text-foreground mb-4">
                "I went from dreading tax season to actually feeling prepared. They made our first S Corp filing feel effortless."
              </blockquote>
              <p className="text-muted-foreground">
                — Sarah K., Tech Growing organization Founder
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 sm:p-12 gradient-border"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to File with Confidence?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a free 15-minute consultation to discuss your tax needs. 
                No obligation, just honest advice.
              </p>
              <Button size="lg" onClick={handleScheduleCall} className="glow-primary text-lg px-10 h-14">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Or call us at <a href="tel:+1234567890" className="text-primary hover:underline">(XXX) XXX-XXXX</a>
              </p>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}

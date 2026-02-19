import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight, 
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Shield,
  Star,
  Users,
  Sparkles,
  AlertCircle,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";
import { useTaxSeasonIntegration } from "@/hooks/tax-season-integration";

const TaxCleanupSpecial = () => {
  const navigate = useNavigate();
  const { showEmailModal, setShowEmailModal, handleCTAClick, handleEmailSubmit } = useTaxSeasonIntegration();
  const [spotsRemaining] = useState(18); // Update this manually or fetch from backend

  return (
    <>
      <Helmet>
        <title>Tax Cleanup Special: 2025 Bookkeeping + Tax Prep - $2,500 | Virtual OPS</title>
        <meta 
          name="description" 
          content="No bookkeeper? No problem. Complete 2025 bookkeeping cleanup + professional tax preparation for $2,500. Limited spots available. Book now before prices increase." 
        />
        <meta name="keywords" content="tax cleanup service, bookkeeping cleanup, small business tax help, 2025 tax preparation, no bookkeeper solution" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate("/")}
              className="text-xl font-bold text-gradient"
            >
              Virtual OPS
            </button>
            <PageThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Urgency Banner */}
            <div className="mb-8 glass rounded-2xl p-4 border-l-4 border-primary glow-primary-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm font-medium">
                  <span className="text-primary">{spotsRemaining} spots remaining</span> • Price increases March 1 • Book now to guarantee April 15 completion
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Limited Time Offer</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block mb-2">2025 Finances a Mess?</span>
                <span className="text-gradient">We'll Fix It + File Your Taxes</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                No bookkeeper? No problem. Complete 2025 bookkeeping cleanup + professional tax preparation for one flat fee.
              </p>

              {/* Price */}
              <div className="glass rounded-3xl p-8 max-w-md mx-auto glow-primary">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-through">Regular: $4,500</p>
                  <p className="text-5xl font-bold text-gradient">$2,500</p>
                  <p className="text-sm text-muted-foreground">Complete cleanup + tax prep + strategy session</p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleCTAClick('tax-cleanup-special')}
                >
                  Book Your Cleanup Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  15-minute assessment call • No obligation • Spots limited
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 flex-wrap pt-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="text-sm">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm">500+ Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm">Licensed Professionals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 px-4 bg-surface/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sound Familiar?</h2>
              <p className="text-lg text-muted-foreground">You're not alone. And you're not out of time.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "You haven't touched your books since January 2025",
                "Receipts are stuffed in shoeboxes and email folders",
                "You have no idea what you actually made (or owe)",
                "QuickBooks is a disaster and you're afraid to look",
                "Tax deadline is approaching and you're panicking",
                "You tried to DIY it but gave up halfway through",
                "Your accountant said \"I can't work with this\"",
                "You're worried about getting audited"
              ].map((problem, idx) => (
                <div key={idx} className="glass rounded-xl p-4 flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{problem}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg font-medium mb-6">We specialize in fixing exactly this situation.</p>
              <Button 
                size="lg"
                onClick={() => handleCTAClick('tax-cleanup-special')}
                className="bg-primary hover:bg-primary/90"
              >
                Let's Fix Your Books
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything Fixed. Everything Filed.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                One flat fee covers complete bookkeeping cleanup, professional tax preparation, and strategic guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Complete 2025 Transaction Cleanup",
                  items: [
                    "Every transaction categorized correctly",
                    "Bank & credit card reconciliation",
                    "Receipt matching and organization",
                    "Duplicate transaction removal"
                  ]
                },
                {
                  icon: TrendingUp,
                  title: "Financial Statement Preparation",
                  items: [
                    "Accurate Profit & Loss statement",
                    "Balance Sheet",
                    "Cash Flow Statement",
                    "Month-by-month breakdown"
                  ]
                },
                {
                  icon: DollarSign,
                  title: "Tax Deduction Maximization",
                  items: [
                    "Find every deduction you're entitled to",
                    "Home office, vehicle, meals, travel",
                    "Software, professional development",
                    "Average $8,500 in deductions found"
                  ]
                },
                {
                  icon: FileText,
                  title: "Professional Tax Return Prep",
                  items: [
                    "Schedule C or 1120S (S-Corp)",
                    "All required schedules and forms",
                    "State tax returns included",
                    "Prepared by licensed tax professional"
                  ]
                },
                {
                  icon: Zap,
                  title: "Tax Filing & Submission",
                  items: [
                    "E-file with IRS",
                    "State filing included",
                    "Confirmation and tracking",
                    "Copy of all filed documents"
                  ]
                },
                {
                  icon: Shield,
                  title: "Audit Protection + 2026 Setup",
                  items: [
                    "Full documentation backup",
                    "Audit-ready file organization",
                    "3-year record retention",
                    "Clean books to start 2026"
                  ]
                }
              ].map((service, idx) => (
                <div key={idx} className="glass rounded-2xl p-6 hover:glow-primary-sm transition-all">
                  <service.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-surface/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple 4-Step Process</h2>
              <p className="text-lg text-muted-foreground">From messy books to filed taxes in 7-14 days</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  step: "1",
                  title: "Book Your Call",
                  time: "15 minutes",
                  description: "Quick assessment of your situation. Confirm scope and timeline. Secure your spot.",
                  icon: Calendar
                },
                {
                  step: "2",
                  title: "Send Us Your Info",
                  time: "1 hour",
                  description: "Bank statements, receipts, invoices, prior year returns. Access to QuickBooks if applicable.",
                  icon: FileText
                },
                {
                  step: "3",
                  title: "We Do The Work",
                  time: "7-14 days",
                  description: "Clean up all 2025 transactions. Prepare financial statements. Complete tax returns. Find every deduction.",
                  icon: Zap
                },
                {
                  step: "4",
                  title: "Review & File",
                  time: "30 minutes",
                  description: "Review your completed returns. Ask questions. E-file with IRS. Done!",
                  icon: CheckCircle2
                }
              ].map((step, idx) => (
                <div key={idx} className="glass rounded-2xl p-6 relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl glow-primary-sm">
                    {step.step}
                  </div>
                  <div className="pl-8">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-primary mb-2">⏱️ {step.time}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 glass rounded-2xl p-6 border-l-4 border-primary">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Timeline Guarantee
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-primary font-medium">Book by March 1</span> → Filed by April 15</p>
                <p><span className="text-primary font-medium">Book by March 15</span> → Filed by April 15 (expedited)</p>
                <p><span className="text-primary font-medium">Book after March 15</span> → Extension filed, completed by June 15</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Business Owners, Real Results</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  quote: "I was 11 months behind on bookkeeping and terrified. They cleaned up everything in 10 days and found $12,000 in deductions I didn't know existed. Worth every penny.",
                  author: "Sarah M.",
                  business: "E-commerce Owner"
                },
                {
                  quote: "My accountant refused to work with my messy QuickBooks. Virtual OPS cleaned it up, prepared my taxes, and saved me $4,500 compared to what I thought I'd owe. Incredible.",
                  author: "Mike T.",
                  business: "Consulting Business"
                },
                {
                  quote: "I thought I'd have to file an extension and stress for another 6 months. They got me done in 2 weeks. Clean books, filed taxes, peace of mind. Best $2,500 I ever spent.",
                  author: "Jennifer L.",
                  business: "Marketing Agency"
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="glass rounded-2xl p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.business}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl p-8 glow-primary">
              <h3 className="text-center font-semibold mb-6">2024 Tax Cleanup Special Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { value: "127", label: "Businesses Helped" },
                  { value: "$8,500", label: "Avg Deductions Found" },
                  { value: "$2,800", label: "Avg Tax Savings" },
                  { value: "100%", label: "Filed On Time" },
                  { value: "0", label: "Audits" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-surface/50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What if my books are REALLY messy?",
                  a: "That's exactly what this package is for. We've handled businesses with 2+ years of backlog. If you have bank statements and receipts (even disorganized), we can fix it."
                },
                {
                  q: "What if I don't have all my receipts?",
                  a: "We'll work with what you have. Bank and credit card statements show most expenses. We'll help you reconstruct missing documentation and maximize deductions with available records."
                },
                {
                  q: "Do you handle S-Corps and LLCs?",
                  a: "Yes. This package covers Schedule C (sole proprietors), 1120S (S-Corps), and 1065 (Partnerships). We'll prepare whatever entity type you need."
                },
                {
                  q: "What if I'm in multiple states?",
                  a: "Multi-state returns are included. We'll file federal + all required state returns at no additional cost."
                },
                {
                  q: "Can I pay in installments?",
                  a: "$1,250 deposit to start, $1,250 upon completion. Payment plans available for qualified clients."
                },
                {
                  q: "What if I need an extension?",
                  a: "If you book after March 15, we'll file an extension to give us time to do it right. You'll still have a complete, accurate return - just filed by the October deadline instead of April."
                }
              ].map((faq, idx) => (
                <div key={idx} className="glass rounded-xl p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass rounded-3xl p-12 text-center glow-primary">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ⏰ {spotsRemaining} Spots Remaining
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                We can only take 25 Tax Cleanup clients to guarantee April 15 completion. 
                The deadline to book is March 1. After that, we'll need to file extensions or refer you to another provider.
              </p>
              
              <div className="space-y-4 mb-8">
                <p className="text-2xl font-bold">Stop Stressing. Start Filing.</p>
                <p className="text-muted-foreground">
                  You don't have to do this alone. You don't have to file an extension. You don't have to overpay on taxes.
                </p>
              </div>

              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                onClick={() => handleCTAClick('tax-cleanup-special')}
              >
                Book Your Tax Cleanup Now
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                15-minute assessment call • No obligation • Spots limited
              </p>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">$2,500</span> • Complete Bookkeeping Cleanup • Tax Preparation & Filing • Strategy Session • Audit Protection • 2026 Setup
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 Virtual OPS. All rights reserved.
              </p>
              <div className="flex gap-6">
                <button onClick={() => navigate("/privacy")} className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </button>
                <button onClick={() => navigate("/terms")} className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        title="Book Your Tax Cleanup Call"
        description="Get your 2025 books cleaned up and taxes filed by April 15. Limited spots available."
      />
    </>
  );
};

export default TaxCleanupSpecial;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight, 
  Building2, 
  Users, 
  Briefcase,
  FileCheck,
  Wallet,
  GraduationCap,
  Bot,
  HeartHandshake,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Receipt,
  Calendar,
  FileText,
  Shield,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { VOPSyMascot } from "@/components/brand/VOPSyMascot";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const audiences = [
  {
    icon: Briefcase,
    title: "Business Owners",
    pain: "Juggling spreadsheets, chasing receipts, and dreading tax season.",
    solution: "A calm, organized system that handles the chaos for you.",
    outcome: "Know exactly where you stand—every day, every month, every quarter."
  },
  {
    icon: Building2,
    title: "Nonprofits",
    pain: "Compliance complexity, grant tracking, and donor reporting headaches.",
    solution: "Purpose-built tools for fund accounting and regulatory peace of mind.",
    outcome: "Focus on mission, not paperwork."
  },
  {
    icon: Users,
    title: "Contractors & Gig Workers",
    pain: "Inconsistent income, tax surprises, and no clear financial picture.",
    solution: "Simple systems that grow with you, no matter how income flows.",
    outcome: "Stay organized without feeling like you need an MBA."
  }
];

const hubFeatures = [
  {
    icon: Wallet,
    title: "Financial Organization",
    description: "Bookkeeping, cash flow tracking, and tax preparation—all in one view."
  },
  {
    icon: FileCheck,
    title: "Compliance Guidance",
    description: "Deadlines, filings, and regulatory requirements handled proactively."
  },
  {
    icon: GraduationCap,
    title: "Education & Templates",
    description: "Courses, guides, and ready-to-use templates for every business stage."
  },
  {
    icon: Bot,
    title: "Meet VOPSy",
    description: "Your AI assistant for questions, automations, and quick answers—available 24/7."
  },
  {
    icon: HeartHandshake,
    title: "Human Backup",
    description: "Real experts when you need them. Never feel like you're on your own."
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Start with clarity",
    description: "Tell us where you are and what you need. No judgment, no assumptions."
  },
  {
    step: "02",
    title: "Organize what you have",
    description: "We help you bring order to existing systems—not start over."
  },
  {
    step: "03",
    title: "Stay supported year-round",
    description: "Ongoing guidance, reminders, and check-ins so nothing falls through."
  },
  {
    step: "04",
    title: "Grow without chaos",
    description: "As you scale, your systems scale with you. No rebuilding required."
  }
];

const vopsyDemoPrompts = [
  {
    icon: TrendingUp,
    label: "Cash Flow",
    prompt: "Analyze my cash flow and runway. What's my current financial position?",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Receipt,
    label: "Tax Planning",
    prompt: "Help me with tax planning. What are my estimated quarterly taxes and upcoming deadlines?",
    color: "from-primary to-orange-400"
  },
  {
    icon: Calendar,
    label: "Compliance",
    prompt: "What compliance deadlines do I have coming up this quarter?",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: FileText,
    label: "Bookkeeping",
    prompt: "Walk me through organizing my bookkeeping. Where should I start?",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    label: "Nonprofit",
    prompt: "I run a nonprofit. What compliance requirements should I be aware of?",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: MessageCircle,
    label: "Get Started",
    prompt: "I'm new here. What can you help me with?",
    color: "from-cyan-500 to-blue-500"
  }
];

export default function Hub() {
  const navigate = useNavigate();
  const { isAuthenticated, login, signup, loginWithGoogle, isLoading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (authMode === "signin") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await signup(email, password, name);
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    }
  };
  return (
    <>
      <Helmet>
        <title>The Hub | Virtual OPS Assist - Your Operations Command Center</title>
        <meta name="description" content="One place to manage compliance, finances, systems, and support—without overwhelm. The Virtual OPS Hub brings clarity to business operations for entrepreneurs and nonprofits." />
        <link rel="canonical" href="https://virtualopsassist.com/hub" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <PublicNav />

        {/* Hero with Auth */}
        <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Value Prop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Your Operations Hub</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Your Operations Hub—
                  <span className="text-gradient block">Built for Real Businesses</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8">
                  One place to manage compliance, finances, systems, and support—without overwhelm.
                </p>

                <div className="hidden lg:flex items-center gap-3">
                  <VOPSyMascot size="sm" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">VOPSy</strong> is ready to help you get started
                  </p>
                </div>
              </motion.div>

              {/* Right: Auth Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
              >
                <div className="glass gradient-border rounded-2xl p-6 sm:p-8">
                  {/* Auth Toggle */}
                  <div className="flex rounded-lg bg-secondary/50 p-1 mb-6">
                    <button
                      onClick={() => setAuthMode("signin")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                        authMode === "signin" 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                        authMode === "signup" 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </button>
                  </div>

                  {/* Auth Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={authMode === "signup"}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full glow-primary" 
                      size="lg"
                      disabled={isSubmitting || authLoading}
                    >
                      {isSubmitting ? "Please wait..." : authMode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {authMode === "signup" 
                      ? "By signing up, you agree to our Terms of Service and Privacy Policy."
                      : "Forgot your password? Contact support for help."
                    }
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Who Is This For?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                If you carry the weight of running something real, this is for you.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {audiences.map((audience, index) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass gradient-border rounded-2xl p-6 sm:p-8"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <audience.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{audience.title}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-destructive/80 mb-1">The Pain</p>
                      <p className="text-sm text-muted-foreground">{audience.pain}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">The Solution</p>
                      <p className="text-sm text-muted-foreground">{audience.solution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success mb-1">The Outcome</p>
                      <p className="text-sm text-muted-foreground">{audience.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Inside */}
        <section className="py-20 px-4 sm:px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What's Inside the Hub?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run operations—organized, connected, and supported.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hubFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 group hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet VOPSy - Interactive Demo */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150" />
                  <VOPSyMascot size="lg" className="relative z-10" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Meet VOPSy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your AI-powered operations assistant. Available 24/7 to answer questions, 
                guide you through financial tasks, and keep you on track. Try asking:
              </p>
            </motion.div>

            {/* Interactive Demo Prompts */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {vopsyDemoPrompts.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => navigate(`/vopsy?prompt=${encodeURIComponent(item.prompt)}`)}
                  className="group glass rounded-xl p-5 text-left hover:border-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-foreground mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">"{item.prompt}"</p>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/vopsy")} 
                className="glow-primary text-lg px-8 h-14"
              >
                <Bot className="w-5 h-5 mr-2" />
                Chat with VOPSy
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Free tier includes AI assistant access
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple steps to lasting clarity.
              </p>
            </motion.div>

            <div className="space-y-6">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{step.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 px-4 sm:px-6 bg-card/50 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground mb-2">500+</p>
                <p className="text-muted-foreground">Businesses Served</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-2">10+ Years</p>
                <p className="text-muted-foreground">Industry Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-2">99%</p>
                <p className="text-muted-foreground">On-Time Compliance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Academy Reference */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Start With a Course or Get the Full System
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Some people start with education. Others want comprehensive support. 
                The Hub brings it all together—learn at your pace, get help when you need it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="https://academy.virtualopsassist.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                    Browse Courses
                  </Button>
                </a>
                <Button size="lg" onClick={() => navigate("/services")} className="glow-primary-sm text-lg px-8 h-14">
                  See Full Services
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-background to-card/50">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Sign in above or create your free account to access the Hub.
              </p>
              <Button 
                size="lg" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="glow-primary text-lg px-10 h-14"
              >
                <ArrowRight className="w-5 h-5 mr-2 rotate-[-90deg]" />
                Back to Sign In
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required
              </p>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}

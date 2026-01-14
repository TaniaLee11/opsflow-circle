import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight,
  Heart,
  Target,
  Users,
  Award,
  Lightbulb,
  Mic,
  BookOpen,
  Sparkles,
  Building2,
  Globe,
  ExternalLink,
  Bot,
  Cog,
  GraduationCap,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

const values = [
  {
    icon: Heart,
    title: "People First",
    description: "We believe in serving real people with real challenges—not just pushing software."
  },
  {
    icon: Target,
    title: "Clarity Over Complexity",
    description: "We simplify operations so you can focus on what matters most."
  },
  {
    icon: Users,
    title: "Partnership Mindset",
    description: "We're not just a service provider. We're invested in your success."
  },
  {
    icon: Award,
    title: "Excellence in Execution",
    description: "Every deadline met, every detail handled, every promise kept."
  }
];

const milestones = [
  { year: "2019", title: "Virtual OPS Founded", description: "Launched with a mission to provide AI-enabled operations for founders, executives, and nonprofits." },
  { year: "2022", title: "500+ Clients Served", description: "Reached our milestone of serving over 500 businesses and nonprofits worldwide." },
  { year: "2024", title: "VOPSy AI Launch", description: "Introduced VOPSy, our AI Operations Director, to provide intelligent support and automation." },
  { year: "2026", title: "Integration Hub", description: "Launching the Virtual OPS Integration Hub—tool-agnostic architecture that orchestrates your existing platforms." }
];

const expertise = [
  { icon: Bot, label: "AI Architecture & Integration" },
  { icon: Cog, label: "Operations Strategy" },
  { icon: Lightbulb, label: "Systems Design" },
  { icon: Building2, label: "Business Automation" },
  { icon: Users, label: "Executive Operations" },
  { icon: Heart, label: "Nonprofit Infrastructure" },
  { icon: GraduationCap, label: "Teaching & Curriculum" },
  { icon: Mic, label: "Public Speaking" },
  { icon: Palette, label: "Creative Direction" },
  { icon: Sparkles, label: "Ethical AI Implementation" },
];

// Other ventures - mentioned briefly as context
const otherVentures = [
  { name: "Overcome Inc", description: "Mission-driven organization focused on empowerment and community programming" },
  { name: "TL Productions", description: "Creative studio launching in 2026" }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About Us | Virtual OPS Assist - Our Story & Mission</title>
        <meta name="description" content="Meet Tania Potter, Founder of Virtual OPS. AI Architect building the 2026 Integration Hub powered by VOPSy. Speaker, Author, Educator & Systems Strategist." />
        <link rel="canonical" href="https://virtualopsassist.com/about" />
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
                Building the Next Generation
                <span className="text-gradient block">of Operations</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Where AI clarifies, systems align, and leaders regain control.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Founder Profile */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass gradient-border rounded-2xl p-8 sm:p-12"
            >
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <div className="text-center lg:text-left">
                    <div className="w-32 h-32 mx-auto lg:mx-0 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-6">
                      <span className="text-4xl font-bold text-white">TP</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Tania Potter</h2>
                    <p className="text-primary font-medium mb-2">Founder & Owner, Virtual OPS</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI Architect | Speaker | Author | Educator | Systems Strategist
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground mb-6">
                      <Globe className="w-4 h-4" />
                      <span>Greater Rochester, NY (Global / Remote)</span>
                    </div>
                    <a 
                      href="https://www.linkedin.com/in/taniapotter" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="text-sm font-medium">Connect on LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Bio */}
                <div className="lg:col-span-2 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    I am the Founder and Owner of Virtual OPS, a next-generation operations and AI-enabled 
                    business infrastructure company built to serve founders, executives, nonprofits, and 
                    growing organizations navigating complexity at scale.
                  </p>
                  <p>
                    As we move into 2026, Virtual OPS is entering its next phase—the launch of our 
                    <strong className="text-foreground"> Integration Hub</strong>, directed by our proprietary 
                    AI operations agent, <strong className="text-foreground">VOPSy</strong>.
                  </p>
                  <p>
                    This next wave is not about replacing tools—<em>it is about orchestrating them</em>.
                  </p>
                  <p>
                    VOPSy is being designed as an AI Operations Director that sits above existing platforms 
                    (finance, compliance, HR, CRM, marketing, and automation), translating fragmented data 
                    into clarity, insight, and action. The Integration Hub will allow organizations to connect 
                    their existing systems and finally understand how their operations are performing in 
                    real time—without needing to be technical experts.
                  </p>
                </div>
              </div>

              {/* Work Domains */}
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-4">My work sits at the crossroads of:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Cog className="w-4 h-4 text-primary" />
                    <span>Business operations and systems architecture</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Bot className="w-4 h-4 text-primary" />
                    <span>Artificial intelligence and ethical automation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Education, teaching, and applied strategy</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Palette className="w-4 h-4 text-primary" />
                    <span>Creative expression as a vehicle for impact</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Virtual OPS Focus */}
        <section className="py-20 px-4 sm:px-6 bg-card/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass gradient-border rounded-2xl p-8 sm:p-12"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Virtual OPS
                </h2>
                <p className="text-primary font-medium">Founded 2019 – Present</p>
              </div>

              <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                AI-enabled operations, finance, compliance, and automation services for founders, 
                executives, nonprofits, and enterprises.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Virtual OPS Integration Hub",
                  "AI-directed operations via VOPSy",
                  "Tool-agnostic architecture",
                  "Executive-level dashboards",
                  "Scalable operations infrastructure"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Other ventures - brief mention */}
              <div className="mt-10 pt-8 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-3">Also leading:</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {otherVentures.map((venture) => (
                    <span key={venture.name} className="text-sm text-muted-foreground">
                      {venture.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Speaking & Teaching */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass gradient-border rounded-2xl p-8 sm:p-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Speaker | Author | Educator</h2>
                  <p className="text-sm text-muted-foreground">Available for keynotes, workshops & trainings</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Speaking Topics:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      AI and operations strategy
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Ethical automation and decision intelligence
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Business systems for founders and nonprofits
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Identity, purpose, and leadership in complex systems
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Available For:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-primary" />
                      Keynotes
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Workshops
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Executive trainings
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Faith-adjacent and secular audiences
                    </li>
                  </ul>
                </div>
              </div>

              <Button onClick={() => navigate("/contact")} className="glow-primary-sm">
                Book a Speaking Engagement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Expertise */}
        <section className="py-16 px-4 sm:px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Areas of Expertise
              </h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              {expertise.map((skill, index) => (
                <motion.div
                  key={skill.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-sm text-muted-foreground"
                >
                  <skill.icon className="w-4 h-4 text-primary" />
                  {skill.label}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What We Stand For
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 sm:px-6 bg-card/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Our Journey
              </h2>
            </motion.div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="w-20 shrink-0">
                    <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                  </div>
                  <div className="flex-1 glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
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
                Ready to Work Together?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                I speak, teach, and build for leaders who are ready for the next level—organizations 
                that understand the future belongs to those who can integrate wisdom, technology, and purpose.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate("/contact")} className="glow-primary text-lg px-8 h-14">
                  Get in Touch
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/services")} className="text-lg px-8 h-14">
                  View Services
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
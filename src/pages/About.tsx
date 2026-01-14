import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight,
  Heart,
  Target,
  Users,
  Award,
  CheckCircle2
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
  { year: "2014", title: "Founded", description: "Started with a mission to bring order to small business operations." },
  { year: "2018", title: "500 Clients", description: "Reached our milestone of serving 500 businesses and nonprofits." },
  { year: "2022", title: "AI Integration", description: "Launched VOPSy AI to provide 24/7 intelligent support." },
  { year: "2024", title: "The Hub", description: "Unified platform bringing all services together in one place." }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About Us | Virtual OPS Assist - Our Story & Mission</title>
        <meta name="description" content="Virtual OPS Assist has been helping entrepreneurs and nonprofits bring clarity to operations since 2014. Learn about our mission, values, and the team behind the Hub." />
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
                We Believe Business 
                <span className="text-gradient block">Shouldn't Be Overwhelming</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Virtual OPS Assist was founded on a simple idea: busy people deserve calm, 
                organized operations—without the chaos.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass gradient-border rounded-2xl p-8 sm:p-12"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We've spent over a decade working with entrepreneurs, small business owners, 
                  and nonprofit leaders. What we found was consistent: brilliant people drowning 
                  in operational complexity.
                </p>
                <p>
                  Spreadsheets everywhere. Compliance deadlines missed. Tax season panic. 
                  No clear view of where the money was going—or coming from.
                </p>
                <p>
                  We built Virtual OPS Assist to change that. Not with more software, 
                  but with a system—combining expert guidance, intelligent tools, and real 
                  human support when it matters.
                </p>
                <p className="text-foreground font-medium">
                  Today, we've helped over 500 businesses find clarity. And we're just getting started.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 bg-card/50">
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
        <section className="py-20 px-4 sm:px-6">
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
        <section className="py-20 px-4 sm:px-6 bg-card/50">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Let's Work Together
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Ready to bring clarity to your operations? We'd love to hear from you.
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

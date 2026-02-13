import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Play, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  Target,
  Shield,
  Zap,
  Bot,
  Award
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { cn } from "@/lib/utils";

const platformHighlights = [
  {
    icon: BookOpen,
    title: "85+ Courses",
    description: "Complete business education library covering operations, compliance, and growth"
  },
  {
    icon: Bot,
    title: "VOPSy AI Assistant",
    description: "24/7 AI-powered guidance for all your business questions"
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description: "Track progress, earn certificates, and level up your skills"
  },
  {
    icon: Shield,
    title: "Expert-Led Content",
    description: "Created by professionals with 15+ years of real-world experience"
  }
];

const trustStats = [
  { value: "500+", label: "Businesses Served" },
  { value: "85+", label: "Courses Available" },
  { value: "15+", label: "Years Experience" },
  { value: "24/7", label: "AI Support" }
];

const testimonials = [
  {
    quote: "These free courses gave me the foundation I needed to launch my LLC. The full platform is even better!",
    author: "Maria G.",
    role: "Small Business Owner"
  },
  {
    quote: "I started with the free courses and was so impressed that I signed up the same day.",
    author: "James T.",
    role: "Freelance Consultant"
  }
];

export default function FreeCourses() {
  const navigate = useNavigate();
  const { courses, isLoading } = usePublicCourses();

  const handleSignUp = () => {
    navigate("/hub");
  };

  return (
    <>
      <Helmet>
        <title>Free Business Courses | Virtual OPS Hub</title>
        <meta 
          name="description" 
          content="Learn business fundamentals for free. Start with our most popular courses on starting, running, and growing your business. No sign-up required." 
        />
        <meta name="keywords" content="free business courses, learn bookkeeping, start a business, business fundamentals, LLC formation, sole proprietorship" />
        <meta property="og:title" content="Free Business Courses | Virtual OPS Hub" />
        <meta property="og:description" content="Learn business fundamentals for free. No sign-up required." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.virtualopsassist.com/free-courses" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />
        
        {/* Page Theme Toggle */}
        <div className="fixed top-20 right-4 z-40">
          <PageThemeToggle className="px-0 py-0" />
        </div>

        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <GraduationCap className="w-4 h-4 mr-2" />
                100% Free • No Account Required
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Learn Business Fundamentals
                <span className="block text-gradient mt-2">Completely Free</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Start your business journey with our most popular introductory courses. 
                No sign-up required—just click and learn.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="glow-primary px-8"
                  onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Learning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleSignUp}
                >
                  Explore Full Platform
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Course Cards Section */}
        <section id="courses" className="py-16 sm:py-24 px-4 sm:px-6 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Featured Free Courses
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These courses cover the essential foundations every business owner needs. 
                Complete them at your own pace—your progress will be here when you return.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-40 bg-muted rounded-lg mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/free-courses/${course.id}`} className="block h-full">
                      <Card className="glass hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                        <CardContent className="p-6 flex flex-col h-full">
                          {/* Thumbnail */}
                          <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <GraduationCap className="w-16 h-16 text-primary/50" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                            <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
                              FREE
                            </Badge>
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 flex-grow">
                            {course.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {course.lessons?.length || 0} lessons
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {Math.round(
                                  course.lessons?.reduce(
                                    (acc, l) => acc + (l.duration_minutes || 5),
                                    0
                                  ) || 15
                                )} min
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-primary">
                              <Users className="w-4 h-4" />
                              {course.enrollment_count || 0}
                            </span>
                          </div>

                          {/* CTA (styled like a button; whole card is clickable) */}
                          <div
                            className={cn(
                              buttonVariants({ size: "sm" }),
                              "w-full mt-4 justify-center group-hover:bg-primary/90"
                            )}
                          >
                            Start Course
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {courses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  We're preparing free courses for you. Sign up to be notified when they're ready!
                </p>
                <Button onClick={handleSignUp}>
                  Join the Waitlist
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Platform Highlights */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Unlock the Full Experience
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                These Are Just the Beginning
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Love these free courses? The full Virtual OPS Hub gives you access to everything you need to run your business with confidence.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass h-full text-center p-6 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <highlight.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{highlight.title}</h3>
                    <p className="text-sm text-muted-foreground">{highlight.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button size="lg" onClick={handleSignUp} className="glow-primary">
                Explore Full Platform
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-gradient mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                What Learners Say
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass p-6">
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">{testimonial.author[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-card/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready for More?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join Virtual OPS Hub and get access to 85+ courses, AI-powered assistance, 
                progress tracking, certificates, and a complete business operations toolkit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={handleSignUp} className="glow-primary px-8">
                  Join Virtual OPS Hub
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/services")}>
                  View All Plans
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                <CheckCircle className="w-4 h-4 inline mr-1 text-success" />
                Free tier available • No credit card required
              </p>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}

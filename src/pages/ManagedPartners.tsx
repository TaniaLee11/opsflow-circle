import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ExternalLink, Building2, Music, Church, Users, Zap } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";
import tlProductionsLogo from "@/assets/partners/tl-productions-logo.png";

interface ManagedPartner {
  name: string;
  description: string;
  icon: React.ElementType;
  url: string;
  logo?: string;
}

const managedPartners: ManagedPartner[] = [
  {
    name: "Overcome, Inc.",
    description: "Faith-based ministry platform focused on spiritual formation, teaching, and community transformation.",
    icon: Church,
    url: "https://overcomeinc.lovable.app",
    logo: "https://overcomeinc.lovable.app/favicon.png",
  },
  {
    name: "TL Productions",
    description: "Creative media and music platform producing content exploring faith, culture, and identity.",
    icon: Music,
    url: "https://tlprod.lovable.app",
    logo: tlProductionsLogo,
  },
  {
    name: "Ren360",
    description: "AI-powered lead generation platform helping businesses identify and connect with qualified prospects.",
    icon: Zap,
    url: "https://www.ren360.io/ai-lead-generation",
    logo: "https://images.clickfunnels.com/cdn-cgi/image/width=200px,fit=scale-down,f=auto,q=80/https://statics.myclickfunnels.com/image/1213415/file/74787ec1e85733da079f5adb5cfe7c92.png",
  },
  {
    name: "Fatherhood Connection",
    description: "Community platform supporting fathers through resources, connection, and mentorship opportunities.",
    icon: Users,
    url: "https://fatherhoodconnection.com",
  },
];

export default function ManagedPartners() {
  return (
    <>
      <Helmet>
        <title>Managed Partners | Virtual OPS Hub</title>
        <meta 
          name="description" 
          content="Virtual Ops designs, builds, and manages intelligent platforms, providing AI-powered operations, infrastructure, and ongoing stewardship." 
        />
      </Helmet>

      <PageThemeToggle />
      <PublicNav />

      <main className="min-h-screen pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                Platform Management
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Managed Partners
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Virtual Ops designs, builds, and manages intelligent platforms, providing AI-powered operations, infrastructure, and ongoing stewardship.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid gap-8 md:grid-cols-2"
            >
              {managedPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-colors">
                    <CardHeader className="pb-4">
                      {partner.logo ? (
                        <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center mb-4 overflow-hidden p-2">
                          <img 
                            src={partner.logo} 
                            alt={`${partner.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to icon if logo fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('hidden');
                              const fallback = e.currentTarget.parentElement?.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        </div>
                      ) : null}
                      <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 ${partner.logo ? 'hidden' : ''}`}>
                        <partner.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-foreground">
                        {partner.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        {partner.description}
                      </CardDescription>
                      
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground/70 mb-4">
                          Built and operationally managed by Virtual Ops.
                        </p>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <a 
                            href={partner.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            Visit {partner.name}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                Our Approach
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Each managed partner represents an independent brand with its own mission and audience. Virtual Ops provides the operational foundation—from platform development and infrastructure to ongoing financial management and strategic support—allowing these organizations to focus on their core purpose.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}

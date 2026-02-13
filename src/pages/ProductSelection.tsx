import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Building2, User, Briefcase, FileText, Shield, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { createCheckout } from "@/lib/stripe";
import { toast } from "sonner";
import { UserTierId } from "@/contexts/UserTierContext";
import { useAuth } from "@/contexts/AuthContext";

interface ProductOption {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  icon: React.ReactNode;
  mode: "payment" | "subscription";
}

const PRODUCT_OPTIONS: Record<string, ProductOption[]> = {
  ai_advisory: [
    {
      id: "advisory_nonprofit",
      priceId: "price_1Sox4DJ3R9oDKFd4uzradhaH",
      name: "Non-Profit Rate",
      description: "AI Advisory services for 501(c)(3) and non-profit organizations",
      price: 125,
      priceLabel: "$125/hour",
      icon: <Building2 className="w-6 h-6" />,
      mode: "payment",
    },
    {
      id: "advisory_forprofit",
      priceId: "price_1Sox4MJ3R9oDKFd4RdC2PcGv",
      name: "For-Profit Rate",
      description: "AI Advisory services for for-profit businesses",
      price: 150,
      priceLabel: "$150/hour",
      icon: <Briefcase className="w-6 h-6" />,
      mode: "payment",
    },
  ],
  ai_tax: [
    {
      id: "personal_tax",
      priceId: "price_1Sk56qJ3R9oDKFd4xzJQi6Ch",
      name: "Personal Tax",
      description: "Individual tax preparation with AI-powered organization",
      price: 125,
      priceLabel: "$125",
      icon: <User className="w-6 h-6" />,
      mode: "payment",
    },
    {
      id: "personal_business_tax",
      priceId: "price_1Sk588J3R9oDKFd47tkpsRsM",
      name: "Personal + Business Tax",
      description: "Combined personal and consulting firm, contracting business, or nonprofit tax preparation",
      price: 175,
      priceLabel: "$175",
      icon: <Briefcase className="w-6 h-6" />,
      mode: "payment",
    },
    {
      id: "business_tax",
      priceId: "price_1Sk59VJ3R9oDKFd4YXwHdTa9",
      name: "Business Tax",
      description: "Full business entity tax preparation",
      price: 250,
      priceLabel: "$250",
      icon: <Building2 className="w-6 h-6" />,
      mode: "payment",
    },
  ],
  ai_compliance: [
    {
      id: "compliance_basic",
      priceId: "price_1Sk588J3R9oDKFd47tkpsRsM",
      name: "Compliance Basic",
      description: "Essential compliance monitoring and alerts",
      price: 175,
      priceLabel: "$175",
      icon: <Shield className="w-6 h-6" />,
      mode: "payment",
    },
    {
      id: "compliance_full",
      priceId: "price_1Sk59VJ3R9oDKFd4YXwHdTa9",
      name: "Compliance Full",
      description: "Comprehensive compliance management with audit readiness",
      price: 250,
      priceLabel: "$250",
      icon: <FileText className="w-6 h-6" />,
      mode: "payment",
    },
  ],
};

const TIER_TITLES: Record<string, string> = {
  ai_advisory: "AI Advisory",
  ai_tax: "AI Tax",
  ai_compliance: "AI Compliance",
};

export default function ProductSelection() {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") as UserTierId;
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const openCheckout = (url: string) => {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const products = PRODUCT_OPTIONS[tier] || [];
  const tierTitle = TIER_TITLES[tier] || "Select Product";

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleContinue = async () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setIsLoading(true);

    try {
      const { url } = await createCheckout(product.priceId, product.mode);

      if (url) {
        toast.message("Opening Stripe Checkout…", { description: "If nothing happens, check your pop-up blocker." });
        openCheckout(url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  if (!tier || !products.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Selection</h1>
          <button
            onClick={() => navigate("/select-tier")}
            className="text-primary hover:underline"
          >
            Return to Tier Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/select-tier")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tier Selection
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {tierTitle} Options
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select the option that best fits your needs
          </p>
        </div>

        {/* Product Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {products.map((product, index) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedProduct(product.id)}
              className={cn(
                "relative p-6 rounded-xl text-left transition-all duration-200",
                "border-2 bg-card hover:bg-muted/50",
                selectedProduct === product.id 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              {selectedProduct === product.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                {product.icon}
              </div>
              
              <h3 className="font-semibold text-foreground text-lg mb-1">{product.name}</h3>
              
              <div className="mb-3">
                <span className="text-2xl font-bold text-foreground">
                  {product.priceLabel}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedProduct || isLoading}
            className={cn(
              "px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all",
              selectedProduct 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting to Checkout...
              </>
            ) : (
              <>
                Continue to Checkout
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

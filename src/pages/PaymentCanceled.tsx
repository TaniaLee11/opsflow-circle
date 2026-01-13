import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <XCircle className="h-16 w-16 text-muted-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">Payment Canceled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Your payment was canceled. No charges were made to your account.
              Feel free to try again when you're ready.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate("/settings")} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface LevelUpAnimationProps {
  level: number;
  show: boolean;
  onComplete: () => void;
}

export function LevelUpAnimation({ level, show, onComplete }: LevelUpAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative"
          >
            {/* Particle effects */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i / 12) * Math.PI * 2) * 150,
                  y: Math.sin((i / 12) * Math.PI * 2) * 150,
                }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="w-6 h-6 text-warning" />
              </motion.div>
            ))}

            {/* Main level badge */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--warning))",
                  "0 0 60px hsl(var(--warning))",
                  "0 0 20px hsl(var(--warning))",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-warning to-warning/50 flex items-center justify-center"
            >
              <div className="text-center">
                <Star className="w-8 h-8 text-warning-foreground mx-auto mb-1 fill-current" />
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-warning-foreground"
                >
                  {level}
                </motion.p>
              </div>
            </motion.div>

            {/* Level up text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
            >
              <p className="text-2xl font-bold text-warning">LEVEL UP!</p>
              <p className="text-muted-foreground">You reached Level {level}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

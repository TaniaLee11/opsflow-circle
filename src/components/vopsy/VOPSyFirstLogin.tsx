import { motion, AnimatePresence } from 'framer-motion';
import { Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FirstLoginOption } from '@/hooks/useVOPSyInitialization';

interface VOPSyFirstLoginProps {
  showActionMode: boolean;
  selectedOption: FirstLoginOption | null;
  onSelectOption: (option: FirstLoginOption) => void;
  onComplete: () => void;
}

const FIRST_LOGIN_OPTIONS: { id: FirstLoginOption; emoji: string; label: string; color: string }[] = [
  { 
    id: 'scattered', 
    emoji: '🟢', 
    label: "I'm just getting started and things feel scattered",
    color: 'text-green-500'
  },
  { 
    id: 'disconnected', 
    emoji: '🟡', 
    label: "I have tools, but nothing is connected",
    color: 'text-yellow-500'
  },
  { 
    id: 'overwhelming', 
    emoji: '🔵', 
    label: "I'm running something real, but it feels messy or overwhelming",
    color: 'text-blue-500'
  },
  { 
    id: 'unsure', 
    emoji: '🟣', 
    label: "I'm not sure — I just know something needs to change",
    color: 'text-purple-500'
  },
];

export function VOPSyFirstLogin({
  showActionMode,
  selectedOption,
  onSelectOption,
  onComplete,
}: VOPSyFirstLoginProps) {
  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showActionMode ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Initial Message */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-lg font-medium mb-4">Hi — I'm VOPSy.</p>
              <p className="text-muted-foreground leading-relaxed">
                I help bring clarity, structure, and connection to the work you're doing — 
                even if you're not sure where to start yet.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You don't need to know what to ask. I'll guide the first steps.
              </p>
              <p className="font-medium mt-6">Let's start simple.</p>
              <p className="text-muted-foreground">Which best describes your current situation?</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {FIRST_LOGIN_OPTIONS.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left h-auto py-4 px-4",
                      "hover:bg-accent hover:border-primary/30 transition-all",
                      "group"
                    )}
                    onClick={() => onSelectOption(option.id)}
                  >
                    <span className="text-xl mr-3">{option.emoji}</span>
                    <span className="text-sm leading-tight">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="action-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Action Mode Message */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Based on that, here's how I can help first:
              </p>
              
              <ul className="space-y-2 list-none pl-0 mb-6">
                <motion.li 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Circle className="h-2 w-2 fill-primary text-primary" />
                  <span>Bring everything into one place</span>
                </motion.li>
                <motion.li 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Circle className="h-2 w-2 fill-primary text-primary" />
                  <span>Connect the tools you already use</span>
                </motion.li>
                <motion.li 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Circle className="h-2 w-2 fill-primary text-primary" />
                  <span>Make sure nothing important gets missed</span>
                </motion.li>
              </ul>

              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                You can move at your own pace.<br />
                Choose what feels easiest to start with.
              </motion.p>
            </div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                onClick={onComplete}
                className="w-full"
              >
                Let's get started
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

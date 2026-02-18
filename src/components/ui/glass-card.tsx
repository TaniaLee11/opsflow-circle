import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({ children, className, hover = false, gradient = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        gradient && "gradient-border",
        hover && "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xl font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

export function GlassCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

import { motion } from "framer-motion";

interface VOPSyMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48"
};

export function VOPSyMascot({ size = "md", animate = true, className = "" }: VOPSyMascotProps) {
  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className}`}
      initial={animate ? { scale: 0.9, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={animate ? { duration: 0.5, ease: "easeOut" as const } : undefined}
    >
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Antenna */}
        <line x1="100" y1="8" x2="100" y2="28" stroke="#1e293b" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="100" cy="8" r="8" fill="#f97316"/>
        
        {/* Ear pieces */}
        <ellipse cx="40" cy="90" rx="12" ry="16" fill="#f97316"/>
        <ellipse cx="160" cy="90" rx="12" ry="16" fill="#f97316"/>
        
        {/* Main body outline */}
        <ellipse cx="100" cy="120" rx="70" ry="85" fill="white" stroke="#1e293b" strokeWidth="4"/>
        
        {/* Face area (dark) */}
        <ellipse cx="100" cy="90" rx="50" ry="45" fill="#1e293b"/>
        
        {/* Eyes */}
        <circle cx="80" cy="85" r="8" fill="#f97316"/>
        <circle cx="120" cy="85" r="8" fill="#f97316"/>
        
        {/* Smile */}
        <path d="M75 105 Q100 120 125 105" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none"/>
        
        {/* Belly area (dark) */}
        <ellipse cx="100" cy="165" rx="30" ry="35" fill="#1e293b"/>
        
        {/* Left arm (waving) */}
        <motion.g
          animate={animate ? { rotate: [0, 15, 0, -5, 0] } : undefined}
          transition={animate ? { duration: 1.5, repeat: Infinity, repeatDelay: 2 } : undefined}
          style={{ transformOrigin: "45px 140px" }}
        >
          <ellipse cx="30" cy="150" rx="12" ry="18" fill="white" stroke="#1e293b" strokeWidth="3"/>
          {/* Hand */}
          <circle cx="25" cy="135" r="14" fill="white" stroke="#1e293b" strokeWidth="3"/>
          {/* Fingers */}
          <circle cx="15" cy="128" r="5" fill="white" stroke="#1e293b" strokeWidth="2"/>
          <circle cx="22" cy="122" r="5" fill="white" stroke="#1e293b" strokeWidth="2"/>
          <circle cx="30" cy="120" r="5" fill="white" stroke="#1e293b" strokeWidth="2"/>
          <circle cx="38" cy="124" r="5" fill="white" stroke="#1e293b" strokeWidth="2"/>
        </motion.g>
        
        {/* Right arm */}
        <ellipse cx="170" cy="150" rx="12" ry="18" fill="white" stroke="#1e293b" strokeWidth="3"/>
        {/* Right hand */}
        <circle cx="175" cy="165" r="12" fill="white" stroke="#1e293b" strokeWidth="3"/>
      </svg>
    </motion.div>
  );
}
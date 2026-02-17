/**
 * Virtual OPS Hub Design System
 * Dark theme colors, typography, and component styles
 */

export const C = {
  // Backgrounds
  bg: "#0B1120",           // Page background
  surface: "#111827",      // Sidebar, top bars
  card: "#1A2332",         // Card backgrounds
  cardHover: "#1E2A3C",    // Card hover state
  border: "#1E293B",       // All borders
  
  // Accent colors
  accent: "#0891B2",       // Primary accent (teal)
  accentSoft: "rgba(8,145,178,0.12)",
  
  // Semantic colors
  green: "#059669",        // Success, revenue, positive
  greenSoft: "rgba(5,150,105,0.12)",
  orange: "#D97706",       // Warning, attention needed
  orangeSoft: "rgba(217,119,6,0.12)",
  red: "#EF4444",          // Error, expenses, negative
  redSoft: "rgba(239,68,68,0.12)",
  
  // Department colors
  purple: "#9333EA",       // Client Care
  purpleSoft: "rgba(147,51,234,0.12)",
  blue: "#2563EB",         // Sales
  blueSoft: "rgba(37,99,235,0.12)",
  pink: "#E11D48",         // People
  pinkSoft: "rgba(225,29,72,0.12)",
  
  // Text colors
  text1: "#F1F5F9",        // Primary text (white-ish)
  text2: "#94A3B8",        // Secondary text
  text3: "#64748B",        // Muted text, labels
};

export const departmentColors = {
  marketing: C.orange,
  sales: C.blue,
  clientcare: C.purple,
  finance: C.green,
  systems: C.accent,
  people: C.pink,
};

export const fonts = {
  family: "'DM Sans', -apple-system, sans-serif",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

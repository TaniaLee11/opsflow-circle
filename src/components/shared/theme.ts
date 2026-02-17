// Virtual OPS Hub Dark Theme Color System
export const C = {
  // Backgrounds
  bg: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  cardHover: "#1E2A3C",
  border: "#1E293B",
  
  // Accent
  accent: "#0891B2",
  accentSoft: "rgba(8,145,178,0.12)",
  
  // Semantic
  green: "#059669",
  greenSoft: "rgba(5,150,105,0.12)",
  orange: "#D97706",
  orangeSoft: "rgba(217,119,6,0.12)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.12)",
  
  // Department colors
  purple: "#9333EA",
  purpleSoft: "rgba(147,51,234,0.12)",
  blue: "#2563EB",
  blueSoft: "rgba(37,99,235,0.12)",
  pink: "#E11D48",
  pinkSoft: "rgba(225,29,72,0.12)",
  
  // Text
  text1: "#F1F5F9",
  text2: "#94A3B8",
  text3: "#64748B",
};

export const departmentColors = {
  marketing: C.orange,
  engagement: C.purple,
  finance: C.green,
  systems: C.accent,
  people: C.pink,
};

// Academy-style gradient helpers
export function getCardGradient(color: string) {
  // Extract RGB from hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `linear-gradient(135deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.05) 100%)`;
}

export function getCardBorder(color: string) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `1px solid rgba(${r},${g},${b},0.25)`;
}

export function getIconBackground(color: string) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r},${g},${b},0.2)`;
}

export const cardBaseStyles = {
  borderRadius: '12px',
  padding: '20px 24px',
  transition: 'all 0.2s ease',
};

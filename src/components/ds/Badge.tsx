import { C } from "@/lib/design-system";

interface BadgeProps {
  type: "ok" | "warn" | "error" | "info" | "muted" | "accent" | "purple" | "pink";
  label: string;
}

export function Badge({ type, label }: BadgeProps) {
  const styles: Record<typeof type, { bg: string; color: string }> = {
    ok: { bg: C.greenSoft, color: C.green },
    warn: { bg: C.orangeSoft, color: C.orange },
    error: { bg: C.redSoft, color: C.red },
    info: { bg: C.blueSoft, color: C.blue },
    muted: { bg: "rgba(100,116,139,0.12)", color: C.text3 },
    accent: { bg: C.accentSoft, color: C.accent },
    purple: { bg: C.purpleSoft, color: C.purple },
    pink: { bg: C.pinkSoft, color: C.pink },
  };

  const style = styles[type];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: style.bg,
        color: style.color,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

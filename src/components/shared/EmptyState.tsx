import { C } from "./theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 48, textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: C.text1, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ color: C.text2, fontSize: 13, marginBottom: actionLabel ? 20 : 0 }}>{description}</div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            background: C.accent,
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

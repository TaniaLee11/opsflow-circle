import { C } from "./theme";

interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  desc?: string;
  actionLabel?: string;
  actionColor?: string;
  onAction?: () => void;
}

export function PageHeader({ breadcrumb, title, desc, actionLabel, actionColor, onAction }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <div style={{ color: C.text3, fontSize: 12, marginBottom: 6 }}>
          {breadcrumb}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: C.text1, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
          {desc && <p style={{ color: C.text2, fontSize: 14 }}>{desc}</p>}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              background: actionColor || C.accent,
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

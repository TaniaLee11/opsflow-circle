import { C } from "@/lib/design-system";
import { ReactNode } from "react";

interface AlertBoxProps {
  icon: string;
  color: string;
  bgColor: string;
  title: string;
  children?: ReactNode;
}

export function AlertBox({ icon, color, bgColor, title, children }: AlertBoxProps) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${color}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: children ? 12 : 0 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ color: C.text1, fontSize: 14, fontWeight: 600 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

import { C } from "@/lib/design-system";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  saveColor?: string;
}

export function Modal({ isOpen, onClose, title, children, onSave, saveLabel = "Save", saveColor = C.accent }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          maxWidth: 500,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ color: C.text1, fontSize: 16, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: C.text3, cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>{children}</div>

        {/* Footer */}
        {onSave && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.text3,
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{
                background: saveColor,
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

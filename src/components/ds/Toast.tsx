import { C } from "@/lib/design-system";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (isVisible) {
      setOpacity(1);
      const timer = setTimeout(() => setOpacity(0), 2700);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity,
        transition: "opacity 0.3s",
      }}
    >
      <CheckCircle size={18} color={C.green} />
      <div style={{ color: C.text1, fontSize: 13, fontWeight: 500 }}>{message}</div>
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const [toast, setToast] = useState({ message: "", isVisible: false });

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
    setTimeout(() => setToast({ message: "", isVisible: false }), 3000);
  };

  return { toast, showToast };
}

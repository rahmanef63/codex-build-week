"use client";

// Dependency-free toast system, styled with the existing .dash-card /
// .dash-error classes (not Tailwind-token classes) so it renders correctly
// everywhere it mounts, ahead of the token migration reaching every consumer.
// Mount <ToastProvider> once (root layout), call useToast() anywhere below
// it. Auto-dismisses after 5s; announced via an aria-live region.
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Variant = "error" | "success";
type Toast = { id: number; message: string; variant?: Variant };
type ToastFn = (message: string, opts?: { variant?: Variant }) => void;

const ToastContext = createContext<ToastFn | null>(null);

const stackStyle: CSSProperties = {
  position: "fixed",
  insetInline: 16,
  bottom: 24,
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  pointerEvents: "none",
};

const cardStyle: CSSProperties = { maxWidth: 420, pointerEvents: "auto" };

export function useToast(): ToastFn {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside <ToastProvider>");
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback<ToastFn>((message, opts) => {
    const id = nextId.current++;
    setToasts((all) => [...all, { id, message, variant: opts?.variant }]);
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div role="status" aria-live="polite" style={stackStyle}>
        {toasts.map((t) => (
          <p
            key={t.id}
            className={`dash-card ${t.variant === "error" ? "dash-error" : ""}`.trim()}
            style={cardStyle}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

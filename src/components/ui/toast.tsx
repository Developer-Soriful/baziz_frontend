"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";
interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}
interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};
const tones: Record<ToastTone, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
  warning: "text-warning",
};

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(90vw,360px)] flex-col gap-2.5">
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div
              key={t.id}
              className="card animate-in flex items-start gap-3 p-3.5 pr-2 shadow-float"
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tones[t.tone])} />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-text-faint transition hover:bg-surface-2 hover:text-text"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}

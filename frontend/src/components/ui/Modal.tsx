"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full max-w-lg animate-scale-in rounded-2xl border border-white/20 bg-white/80 p-6 shadow-glass backdrop-blur-xl",
          "dark:border-border-dark dark:bg-surface-dark-card/90",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary"
          >
            {title}
          </h2>

          <Button
            type="button"
            variant="ghost"
            aria-label="Fechar"
            className="min-h-10 px-2 py-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

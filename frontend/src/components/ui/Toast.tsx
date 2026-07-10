import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<
  ToastVariant,
  { icon: ReactNode; container: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    container:
      "border-success-light/25 bg-success-light/10 dark:border-success-dark/30 dark:bg-success-dark/10",
    iconColor: "text-success-light dark:text-success-dark",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    container:
      "border-error-light/25 bg-error-light/10 dark:border-error-dark/30 dark:bg-error-dark/10",
    iconColor: "text-error-light dark:text-error-dark",
  },
  info: {
    icon: <Info className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    container:
      "border-info-light/25 bg-info-light/10 dark:border-info-dark/30 dark:bg-info-dark/10",
    iconColor: "text-info-light dark:text-info-dark",
  },
};

export function Toast({
  variant,
  message,
  title,
  onClose,
  className,
}: ToastProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-soft",
        config.container,
        className,
      )}
    >
      <div className={cn("mt-0.5 shrink-0", config.iconColor)}>{config.icon}</div>

      <div className="min-w-0 flex-1">
        {title ? (
          <p className="font-display text-sm font-semibold tracking-display text-content-primary dark:text-content-dark-primary">
            {title}
          </p>
        ) : null}
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          {message}
        </p>
      </div>

      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          aria-label="Fechar notificação"
          className="min-h-8 rounded-full px-2 py-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      ) : null}
    </div>
  );
}

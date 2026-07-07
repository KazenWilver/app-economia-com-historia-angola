import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-bordeaux text-white hover:bg-bordeaux/90 focus-visible:outline-bordeaux dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90 dark:focus-visible:outline-bordeaux-dark",
  secondary:
    "bg-petrol text-white hover:bg-petrol/90 focus-visible:outline-petrol dark:bg-petrol-dark dark:hover:bg-petrol-dark/90 dark:focus-visible:outline-petrol-dark",
  ghost:
    "bg-transparent text-identity-gray hover:bg-surface-secondary hover:text-content-primary focus-visible:outline-bordeaux dark:text-content-dark-secondary dark:hover:bg-surface-dark-secondary dark:hover:text-content-dark-primary dark:focus-visible:outline-bordeaux-dark",
  destructive:
    "bg-error-light text-white hover:bg-error-light/90 focus-visible:outline-error-light dark:bg-error-dark dark:hover:bg-error-dark/90 dark:focus-visible:outline-error-dark",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-display text-sm font-semibold transition-all duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {isLoading ? "A carregar..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";

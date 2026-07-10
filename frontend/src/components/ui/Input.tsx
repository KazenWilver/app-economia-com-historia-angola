import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelClassName, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              "font-display text-sm font-semibold tracking-display text-content-primary dark:text-content-dark-primary",
              labelClassName,
            )}
          >
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(
            "min-h-11 w-full rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-sm text-content-primary transition-colors duration-200",
            "placeholder:text-content-tertiary focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/15",
            "dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:placeholder:text-content-dark-tertiary",
            "dark:focus:border-bordeaux-dark dark:focus:ring-bordeaux-dark/20",
            error &&
              "border-error-light focus:border-error-light focus:ring-error-light/20 dark:border-error-dark dark:focus:border-error-dark dark:focus:ring-error-dark/20",
            className,
          )}
          {...props}
        />

        {hint && !error ? (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-content-tertiary dark:text-content-dark-tertiary"
          >
            {hint}
          </p>
        ) : null}

        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-xs text-error-light dark:text-error-dark"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

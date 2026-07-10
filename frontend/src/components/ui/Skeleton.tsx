import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl bg-gradient-to-r from-surface-secondary via-surface-card to-surface-secondary bg-[length:200%_100%] animate-shimmer",
        "dark:from-surface-dark-secondary dark:via-surface-dark-card dark:to-surface-dark-secondary",
        className,
      )}
    />
  );
}

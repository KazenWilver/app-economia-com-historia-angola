import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeType =
  | "text"
  | "audio"
  | "video"
  | "podcast"
  | "jindungo"
  | "forum"
  | "quiz"
  | "default";

export interface BadgeProps {
  type?: BadgeType;
  children: ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeType, string> = {
  text: "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
  audio: "bg-petrol/15 text-petrol dark:bg-petrol-dark/15 dark:text-petrol-dark",
  video: "bg-bordeaux/15 text-bordeaux dark:bg-bordeaux-dark/15 dark:text-bordeaux-dark",
  podcast: "bg-terracotta/15 text-terracotta",
  jindungo: "bg-gold/15 text-gold dark:bg-gold-dark/15 dark:text-gold-dark",
  forum: "bg-petrol/15 text-petrol dark:bg-petrol-dark/15 dark:text-petrol-dark",
  quiz: "bg-bordeaux/15 text-bordeaux dark:bg-bordeaux-dark/15 dark:text-bordeaux-dark",
  default:
    "bg-surface-secondary text-identity-gray dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
};

export function Badge({
  type = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-display text-xs font-semibold tracking-display",
        badgeStyles[type],
        className,
      )}
    >
      {children}
    </span>
  );
}

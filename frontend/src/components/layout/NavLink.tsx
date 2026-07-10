"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/layout/nav-links";

interface NavLinkProps {
  item: NavLinkItem;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ item, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative font-display text-sm font-semibold tracking-display transition-colors",
        "after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-bordeaux after:transition-all after:duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux",
        "dark:after:bg-bordeaux-dark dark:focus-visible:outline-bordeaux-dark",
        isActive
          ? "text-bordeaux after:w-full dark:text-bordeaux-dark"
          : "text-content-primary after:w-0 hover:text-bordeaux hover:after:w-full dark:text-content-dark-primary dark:hover:text-bordeaux-dark",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}

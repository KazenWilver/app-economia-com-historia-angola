import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/layout/nav-links";

interface NavLinkProps {
  item: NavLinkItem;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ item, className, onClick }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "relative font-display text-sm font-semibold text-content-primary transition-colors",
        "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-bordeaux after:transition-all after:duration-200",
        "hover:text-bordeaux hover:after:w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordeaux",
        "dark:text-content-dark-primary dark:after:bg-bordeaux-dark dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}

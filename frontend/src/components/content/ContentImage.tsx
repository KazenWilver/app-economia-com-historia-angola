import { resolveMediaUrl } from "@/components/content/types";
import { cn } from "@/lib/utils";

interface ContentImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ContentImage({ src, alt, className }: ContentImageProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveMediaUrl(src)}
        alt={alt}
        className="max-h-[32rem] w-full object-cover"
        loading="lazy"
      />
    </figure>
  );
}

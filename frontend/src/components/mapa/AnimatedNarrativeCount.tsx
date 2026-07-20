"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNarrativeCountProps {
  value: number;
  className?: string;
}

export function AnimatedNarrativeCount({
  value,
  className,
}: AnimatedNarrativeCountProps) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);
  const previousRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplay(value);
      previousRef.current = value;
      return;
    }

    const from = previousRef.current;
    const to = value;
    const durationMs = 700;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousRef.current = to;
      }
    };

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return (
    <span className={className} aria-live="polite">
      {display}
    </span>
  );
}

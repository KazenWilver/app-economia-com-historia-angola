"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";
import { WelcomeBanner } from "@/components/auth/WelcomeBanner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

gsap.registerPlugin(useGSAP);

function AngolaMap() {
  return (
    <svg
      viewBox="0 0 140 300"
      className="h-52 w-auto sm:h-64 md:h-72"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient
          id="angolaGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#8A1538" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#2C7A7B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2" />
        </linearGradient>
        <filter id="mapGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M12 18 L28 14 L32 34 L16 38 Z"
        fill="url(#angolaGradient)"
        stroke="#E11D48"
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#mapGlow)"
      />

      <path
        d="M34 42 L52 36 L64 48 L72 70 L78 98 L86 126 L92 156 L96 188 L94 218 L86 246 L72 268 L54 278 L40 262 L32 232 L28 198 L24 162 L22 126 L26 90 L30 58 Z"
        fill="url(#angolaGradient)"
        stroke="#E11D48"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#mapGlow)"
      />
    </svg>
  );
}

export function LandingHero() {
  const { isAuthenticated, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(
          [titleRef.current, subtitleRef.current, mapRef.current, ctaRef.current],
          {
            opacity: 1,
            y: 0,
            scale: 1,
          },
        );
        return;
      }

      gsap.set(
        [titleRef.current, subtitleRef.current, mapRef.current, ctaRef.current],
        {
          opacity: 0,
        },
      );
      gsap.set(mapRef.current, { scale: 0.92 });
      gsap.set(ctaRef.current, { y: 24 });

      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      timeline
        .to(titleRef.current, { opacity: 1, duration: 1 })
        .to(subtitleRef.current, { opacity: 1, duration: 0.8 }, "-=0.55")
        .to(
          mapRef.current,
          { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
          "-=0.45",
        )
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.85 }, "-=0.35");
    },
    { scope: containerRef },
  );

  const showExplorar = !isLoading && isAuthenticated;

  return (
    <section
      ref={containerRef}
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-dark px-4 py-16 sm:px-6 sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(138_21_56/0.16),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgb(44_122_123/0.10),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <WelcomeBanner />

        <p className="mb-6 font-display text-sm font-semibold tracking-display text-bordeaux-dark sm:mb-8">
          Jindungo
        </p>

        <div ref={mapRef} className="mb-8 sm:mb-10">
          <AngolaMap />
        </div>

        <h1
          ref={titleRef}
          className="max-w-3xl text-center font-display text-3xl font-extrabold leading-[1.1] tracking-display text-content-dark-primary sm:text-4xl md:text-5xl"
        >
          Economia com História – Angola
        </h1>

        <p
          ref={subtitleRef}
          className="mt-5 max-w-xl text-center text-base leading-relaxed text-content-dark-secondary sm:text-lg"
        >
          Explora a economia angolana através de conteúdos, quizzes, fórum e
          mapa interactivo.
        </p>

        <div ref={ctaRef} className="mt-10">
          {showExplorar ? (
            <Link href="/explorar" aria-label="Explorar conteúdos Jindungo">
              <Button variant="primary" className="min-h-12 px-8 text-base">
                Explorar
              </Button>
            </Link>
          ) : (
            <Link href="/login" aria-label="Entrar na plataforma Jindungo">
              <Button variant="primary" className="min-h-12 px-8 text-base">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

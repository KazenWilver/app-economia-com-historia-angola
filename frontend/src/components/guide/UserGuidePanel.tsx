"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ListCollapse,
  ListTree,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  USER_GUIDE_META,
  USER_GUIDE_SECTIONS,
  type GuideAudience,
  type GuideSection,
  filterGuideSections,
  guideImagePublicPath,
} from "@shared/guide";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

interface UserGuidePanelProps {
  audience?: GuideAudience | "full";
  variant?: "public" | "admin";
  aboutHref?: string;
}

export function UserGuidePanel({
  audience = "full",
  variant = "public",
  aboutHref = "/sobre-nos",
}: UserGuidePanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(() => filterGuideSections(audience), [audience]);
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(sections.map((section) => section.id)),
  );

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        return;
      }

      gsap.from("[data-guide-hero]", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
      });
      gsap.from("[data-guide-actions] > *", {
        opacity: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.08,
        delay: 0.15,
        ease: "power2.out",
      });
      gsap.from("[data-guide-section]", {
        opacity: 0,
        y: 22,
        duration: 0.5,
        stagger: 0.04,
        delay: 0.25,
        ease: "power2.out",
      });
    },
    { scope: rootRef },
  );

  const animatePanel = useCallback(
    (panel: HTMLElement | null, open: boolean) => {
      if (!panel) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        panel.style.height = open ? "auto" : "0px";
        panel.style.opacity = open ? "1" : "0";
        return;
      }

      gsap.killTweensOf(panel);
      if (open) {
        gsap.set(panel, { height: "auto", opacity: 0 });
        const height = panel.offsetHeight;
        gsap.fromTo(
          panel,
          { height: 0, opacity: 0 },
          {
            height,
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(panel, { height: "auto" });
            },
          },
        );
      } else {
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.28,
          ease: "power1.in",
        });
      }
    },
    [],
  );

  const toggleSection = (section: GuideSection) => {
    const willOpen = !openIds.has(section.id);
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (willOpen) {
        next.add(section.id);
      } else {
        next.delete(section.id);
      }
      return next;
    });

    const panel = rootRef.current?.querySelector<HTMLElement>(
      `[data-guide-panel="${section.id}"]`,
    );
    requestAnimationFrame(() => animatePanel(panel ?? null, willOpen));
  };

  const expandAll = () => {
    setOpenIds(new Set(sections.map((section) => section.id)));
    requestAnimationFrame(() => {
      sections.forEach((section) => {
        const panel = rootRef.current?.querySelector<HTMLElement>(
          `[data-guide-panel="${section.id}"]`,
        );
        animatePanel(panel ?? null, true);
      });
    });
  };

  const collapseAll = () => {
    setOpenIds(new Set());
    requestAnimationFrame(() => {
      sections.forEach((section) => {
        const panel = rootRef.current?.querySelector<HTMLElement>(
          `[data-guide-panel="${section.id}"]`,
        );
        animatePanel(panel ?? null, false);
      });
    });
  };

  const accent =
    variant === "admin"
      ? "text-bordeaux dark:text-bordeaux-dark"
      : "text-gold dark:text-gold-dark";

  return (
    <div ref={rootRef} className="space-y-8">
      <header
        data-guide-hero
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bordeaux/10 via-surface-card to-gold/10 px-6 py-10 dark:border-border-dark dark:from-bordeaux-dark/20 dark:via-surface-dark-card dark:to-gold-dark/10 sm:px-10"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-bordeaux/10 blur-3xl dark:bg-bordeaux-dark/20" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-36 w-36 rounded-full bg-gold/15 blur-3xl dark:bg-gold-dark/20" />
        <div className="relative space-y-4">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border bg-surface-card/80 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider dark:border-border-dark dark:bg-surface-dark-card/80",
              accent,
            )}
          >
            <CircleHelp className="h-3.5 w-3.5" strokeWidth={1.5} />
            {USER_GUIDE_META.codename} · v{USER_GUIDE_META.version}
          </span>
          <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary sm:text-4xl">
            {USER_GUIDE_META.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary sm:text-base">
            {USER_GUIDE_META.intro}
          </p>
          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            {USER_GUIDE_META.institution}
          </p>
          <p className="text-xs font-medium text-content-secondary dark:text-content-dark-secondary">
            {USER_GUIDE_META.creators}
          </p>
          <Link
            href={aboutHref}
            className="inline-flex font-display text-sm font-semibold text-bordeaux underline-offset-4 hover:underline dark:text-bordeaux-dark"
          >
            Conhecer a equipa — Sobre nós →
          </Link>
        </div>
      </header>

      <div data-guide-actions className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={expandAll}>
          <ListTree className="h-4 w-4" strokeWidth={1.5} />
          Expandir tudo
        </Button>
        <Button type="button" variant="secondary" onClick={collapseAll}>
          <ListCollapse className="h-4 w-4" strokeWidth={1.5} />
          Recolher tudo
        </Button>
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          {sections.length} secções · cada uma com «para que serve», o que podes
          e o que não podes fazer
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openIds.has(section.id);

          return (
            <Card
              key={section.id}
              data-guide-section
              hoverLift={false}
              className="overflow-hidden border-border/80 p-0 dark:border-border-dark/80"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`guide-panel-${section.id}`}
                onClick={() => toggleSection(section)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-secondary/60 dark:hover:bg-surface-dark-secondary/60"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bordeaux/10 text-bordeaux dark:bg-bordeaux-dark/20 dark:text-bordeaux-dark">
                  <BookOpenCheck className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-display text-base font-bold tracking-display text-content-primary dark:text-content-dark-primary">
                    {section.title}
                  </span>
                  <span className="block text-sm text-content-secondary dark:text-content-dark-secondary">
                    {section.summary}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 text-content-tertiary transition-transform duration-300 dark:text-content-dark-tertiary",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={1.5}
                />
              </button>

              <div
                id={`guide-panel-${section.id}`}
                data-guide-panel={section.id}
                className="overflow-hidden"
                style={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              >
                <CardContent className="space-y-5 border-t border-border/70 px-5 py-5 dark:border-border-dark/70">
                  <div className="rounded-2xl border border-petrol/20 bg-petrol/5 px-4 py-3 dark:border-petrol-dark/30 dark:bg-petrol-dark/10">
                    <p className="mb-1 font-display text-xs font-bold uppercase tracking-wider text-petrol dark:text-petrol-dark">
                      Para que serve
                    </p>
                    <p className="text-sm leading-relaxed text-content-primary dark:text-content-dark-primary">
                      {section.purpose}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/25">
                      <p className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        O que podes fazer
                      </p>
                      <ul className="space-y-1.5 text-sm text-emerald-950 dark:text-emerald-100">
                        {section.canDo.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/25">
                      <p className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                        <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                        O que não podes fazer
                      </p>
                      <ul className="space-y-1.5 text-sm text-rose-950 dark:text-rose-100">
                        {section.cannotDo.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600 dark:bg-rose-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-content-tertiary dark:text-content-dark-tertiary">
                      Como fazer
                    </p>
                    <ol className="space-y-4">
                      {section.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-xs font-bold text-gold dark:bg-gold-dark/20 dark:text-gold-dark">
                            {index + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                              {step.title}
                            </p>
                            <p className="text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary">
                              {step.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {section.images && section.images.length > 0 ? (
                    <div className="space-y-4">
                      <p className="font-display text-xs font-bold uppercase tracking-wider text-content-tertiary dark:text-content-dark-tertiary">
                        Vê o ecrã
                      </p>
                      {section.images.map((image) => (
                        <figure key={image.file} className="space-y-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={guideImagePublicPath(image.file)}
                            alt={image.alt}
                            className="h-auto w-full max-w-3xl rounded-xl object-contain"
                            loading="lazy"
                          />
                          <figcaption className="text-sm text-content-secondary dark:text-content-dark-secondary">
                            {image.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-content-tertiary dark:text-content-dark-tertiary">
        {USER_GUIDE_SECTIONS.length} secções no guia · {USER_GUIDE_META.creators}
      </p>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { GraduationCap, Mail, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import {
  PROJECT_ABOUT,
  TEAM_CREDIT_LINE,
  TEAM_MEMBERS,
} from "@shared/guide";
import { Card, CardContent } from "@/components/ui/Card";

gsap.registerPlugin(useGSAP);

interface AboutUsPanelProps {
  helpHref?: string;
}

export function AboutUsPanel({ helpHref = "/ajuda" }: AboutUsPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        return;
      }

      gsap.from("[data-about-hero]", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: "power2.out",
      });
      gsap.from("[data-about-card]", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.2,
        ease: "power2.out",
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="space-y-8">
      <header
        data-about-hero
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-petrol/10 via-surface-card to-bordeaux/10 px-6 py-10 dark:border-border-dark dark:from-petrol-dark/20 dark:via-surface-dark-card dark:to-bordeaux-dark/15 sm:px-10"
      >
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card/80 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-petrol dark:border-border-dark dark:bg-surface-dark-card/80 dark:text-petrol-dark">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            {PROJECT_ABOUT.group} · {PROJECT_ABOUT.academicYear}
          </span>
          <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary sm:text-4xl">
            Sobre nós
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-content-secondary dark:text-content-dark-secondary">
            {PROJECT_ABOUT.tagline}
          </p>
          <p className="text-sm font-medium text-content-primary dark:text-content-dark-primary">
            {TEAM_CREDIT_LINE}
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-about-card hoverLift={false}>
          <CardContent className="space-y-3 pt-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bordeaux/10 text-bordeaux dark:bg-bordeaux-dark/20 dark:text-bordeaux-dark">
              <Sparkles className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <h2 className="font-display text-lg font-bold text-content-primary dark:text-content-dark-primary">
              Missão
            </h2>
            <p className="text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary">
              {PROJECT_ABOUT.mission}
            </p>
          </CardContent>
        </Card>

        <Card data-about-card hoverLift={false}>
          <CardContent className="space-y-3 pt-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-petrol/10 text-petrol dark:bg-petrol-dark/20 dark:text-petrol-dark">
              <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <h2 className="font-display text-lg font-bold text-content-primary dark:text-content-dark-primary">
              Contexto académico
            </h2>
            <ul className="space-y-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              <li>
                <strong className="text-content-primary dark:text-content-dark-primary">
                  Instituição:
                </strong>{" "}
                {PROJECT_ABOUT.institution}
              </li>
              <li>
                <strong className="text-content-primary dark:text-content-dark-primary">
                  Unidade curricular:
                </strong>{" "}
                {PROJECT_ABOUT.course}
              </li>
              <li>
                <strong className="text-content-primary dark:text-content-dark-primary">
                  Equipa:
                </strong>{" "}
                {PROJECT_ABOUT.group} · {PROJECT_ABOUT.academicYear}
              </li>
              <li>
                <strong className="text-content-primary dark:text-content-dark-primary">
                  Codinome:
                </strong>{" "}
                {PROJECT_ABOUT.codename}
              </li>
              <li>
                <strong className="text-content-primary dark:text-content-dark-primary">
                  Stack:
                </strong>{" "}
                {PROJECT_ABOUT.stack}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
          A equipa
        </h2>
        <p className="max-w-2xl text-sm text-content-secondary dark:text-content-dark-secondary">
          O projecto {PROJECT_ABOUT.product} foi desenvolvido pelos membros do{" "}
          {PROJECT_ABOUT.group} no âmbito da {PROJECT_ABOUT.course}.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.name} data-about-card hoverLift={false}>
              <CardContent className="space-y-2 pt-2">
                <h3 className="font-display text-lg font-bold text-bordeaux dark:text-bordeaux-dark">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                  {member.role}
                </p>
                <p className="text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary">
                  {member.focus}
                </p>
                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 text-sm text-petrol hover:underline dark:text-petrol-dark"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {member.email}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-center text-sm text-content-secondary dark:text-content-dark-secondary">
        Precisas de ajuda a usar a plataforma?{" "}
        <Link
          href={helpHref}
          className="font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
        >
          Abre o guia completo
        </Link>
        .
      </p>
    </div>
  );
}

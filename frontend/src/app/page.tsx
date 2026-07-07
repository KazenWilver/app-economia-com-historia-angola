"use client";

import { WelcomeBanner } from "@/components/auth/WelcomeBanner";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <WelcomeBanner />

      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-bordeaux dark:text-bordeaux-dark">
          Jindungo
        </h1>
        <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
          Economia com História — Angola
        </p>
      </div>
    </div>
  );
}

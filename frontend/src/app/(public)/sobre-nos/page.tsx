"use client";

import { AboutUsPanel } from "@/components/guide/AboutUsPanel";

export default function SobreNosPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <AboutUsPanel helpHref="/ajuda" />
    </div>
  );
}

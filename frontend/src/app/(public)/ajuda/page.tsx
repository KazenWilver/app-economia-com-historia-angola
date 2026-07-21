"use client";

import { UserGuidePanel } from "@/components/guide/UserGuidePanel";

export default function AjudaPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <UserGuidePanel audience="full" variant="public" />
    </div>
  );
}

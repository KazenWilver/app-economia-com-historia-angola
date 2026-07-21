"use client";

import { AboutUsPanel } from "@/components/guide/AboutUsPanel";

export default function AdminSobreNosPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AboutUsPanel helpHref="/admin/ajuda" />
    </div>
  );
}

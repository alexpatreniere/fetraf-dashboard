// src/app/dashboard/filiados/page.tsx
import { Suspense } from "react";
import FiliadosClient from "./Client";

export const metadata = {
  title: "Filiados — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <FiliadosClient />
    </Suspense>
  );
}

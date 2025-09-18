// src/app/dashboard/relatorios/page.tsx
import { Suspense } from "react";
import RelatoriosClient from "./Client";

export const metadata = {
  title: "Relatórios — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <RelatoriosClient />
    </Suspense>
  );
}

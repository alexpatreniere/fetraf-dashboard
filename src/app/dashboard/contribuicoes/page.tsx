// src/app/dashboard/contribuicoes/page.tsx
import { Suspense } from "react";
import ContribuicoesClient from "./Client";

export const metadata = {
  title: "Contribuições — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <ContribuicoesClient />
    </Suspense>
  );
}

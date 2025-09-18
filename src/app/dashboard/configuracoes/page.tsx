// src/app/dashboard/configuracoes/page.tsx
import { Suspense } from "react";
import ConfiguracoesClient from "./Client";

export const metadata = {
  title: "Configurações — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <ConfiguracoesClient />
    </Suspense>
  );
}

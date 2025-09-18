// src/app/dashboard/sindicatos/page.tsx
import { Suspense } from "react";
import SindicatosClient from "./Client";

export const metadata = {
  title: "Sindicatos — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <SindicatosClient />
    </Suspense>
  );
}

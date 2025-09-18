// src/app/dashboard/usuarios/page.tsx
import { Suspense } from "react";
import UsuariosClient from "./Client";

export const metadata = {
  title: "Usuários — FETRAF",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="card p-6 text-sm text-[var(--muted)]">Carregando…</div>
      }
    >
      <UsuariosClient />
    </Suspense>
  );
}

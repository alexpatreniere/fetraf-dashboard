// src/app/dashboard/configuracoes/usuarios/novo/page.tsx
import { Suspense } from "react";
import NovoUsuarioClient from "./Client";

export const metadata = {
  title: "Novo usuário — FETRAF",
  description: "Criar um novo usuário no sistema FETRAF",
};

// (Opcional) defina viewport no lado do servidor, NUNCA em Client
export const viewport = {
  themeColor: "#111827",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Carregando…</div>}>
      <NovoUsuarioClient />
    </Suspense>
  );
}

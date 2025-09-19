"use client";

import { ReactNode } from "react";
import { useMe } from "@/src/lib/useMe";
import Link from "next/link";

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join("");
}

export default function ClientShell({ children }: { children: ReactNode }) {
  const { me, loading, error, refresh } = useMe();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Topbar simples */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="font-semibold">Sistema FETRAF</Link>

          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs text-neutral-500">Carregando perfil…</span>
            )}
            {error && (
              <button
                onClick={refresh}
                className="text-xs text-rose-600 dark:text-rose-300 underline underline-offset-4"
                title={error}
              >
                Recarregar perfil
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {initials(me?.name || me?.email)}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium">{me?.name || "Usuário"}</div>
                <div className="text-xs text-neutral-500">{me?.role || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-7xl w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
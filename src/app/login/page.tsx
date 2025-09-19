"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@fetraf.local");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // URL da API (build-time). Se não houver, cai no /api do próprio Next.
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

  // Se já tem sessão válida, redireciona
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (r.ok) window.location.href = "/dashboard";
      } catch {
        // ignora
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // Se houver NEXT_PUBLIC_API_URL, usa a API externa; senão usa a rota interna.
      const url = API ? `${API}/auth/login` : "/api/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Se o backend autentica via cookie, mantenha include:
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      // Tenta JSON seguro (evita Unexpected token < quando backend retorna HTML)
      const ct = res.headers.get("content-type") || "";
      const bodyText = await res.text();
      const data = ct.includes("application/json")
        ? safeJson(bodyText)
        : { raw: bodyText };

      if (!res.ok || (data && data.ok === false)) {
        const msg =
          data?.error ||
          data?.message ||
          data?.raw ||
          `Falha no login (HTTP ${res.status})`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const next =
        new URLSearchParams(window.location.search).get("next") || "/dashboard";
      window.location.href = next;
    } catch (e: any) {
      setErr(e?.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm text-neutral-900 dark:text-neutral-100"
        aria-labelledby="login-title"
      >
        {/* Logo + título */}
        <div className="text-center space-y-2 mb-6">
          <picture>
            <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
            <img
              src="/logo-light.svg"
              alt="FETRAF"
              className="mx-auto h-10 w-auto max-w-[180px] select-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/favicon.ico";
              }}
            />
          </picture>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">FETRAF</p>

          <h1 id="login-title" className="text-xl font-semibold">
            Sistema FETRAF
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Federação dos Trabalhadores do Ramo Financeiro do RJ e ES
          </p>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              inputMode="email"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Erro */}
        {err && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-400/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300"
          >
            {err}
          </div>
        )}

        {/* Ações */}
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-4 py-2 text-sm transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400" />
            <Link
              href="/login/reset"
              className="text-sm underline underline-offset-4 hover:opacity-90"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} FETRAF — Todos os direitos reservados
        </p>
      </form>
    </div>
  );
}

/** JSON.parse seguro */
function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

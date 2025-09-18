"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@fetraf.local");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Se já tem sessão válida, redireciona
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (r.ok) window.location.href = "/dashboard";
      } catch {}
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // evita "Unexpected token <" quando API manda HTML
      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch { data = { raw }; }

      if (!res.ok || !data?.ok) {
        const msg = data?.error || data?.message || data?.raw || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
      window.location.href = next;
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-soft text-[var(--fg)]"
        aria-labelledby="login-title"
      >
        {/* Logo + título */}
        <div className="text-center space-y-2 mb-6">
          {/* Coloque os arquivos em /public: logo-light.svg e logo-dark.svg */}
          <picture>
            <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
            <img
              src="/logo-light.svg"
              alt="FETRAF"
              className="mx-auto h-10 w-auto"
              onError={(e) => {
                // fallback se não tiver SVGs ainda
                (e.currentTarget as HTMLImageElement).src = "/favicon.ico";
              }}
            />
          </picture>

          <p className="text-xs text-neutral-500">FETRAF</p>

          <h1 id="login-title" className="text-xl font-semibold">
            Sistema FETRAF
          </h1>
          <p className="text-sm text-neutral-400">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              autoComplete="username"
              inputMode="email"
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
              className="input w-full"
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Erro */}
        {err && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
          >
            {err}
          </div>
        )}

        {/* Ações */}
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full !text-white font-medium"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500"> </span>
            <a
              href="/login/reset"
              className="text-sm underline underline-offset-4 hover:opacity-90"
            >
              Esqueci minha senha
            </a>
          </div>
        </div>

        {/* Rodapé */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} FETRAF — Todos os direitos reservados
        </p>
      </form>
    </div>
  );
}

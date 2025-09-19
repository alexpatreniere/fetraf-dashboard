"use client";
import Brand from "@/components/Brand";
import Link from "next/link";
import { useEffect, useState } from "react";

function parseMaybeJson(t: string){ try{ return JSON.parse(t); }catch{ return { raw:t }; } }

export default function LoginPage() {
  const [email, setEmail] = useState("admin@fetraf.local");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Se já tem sessão, vai pro dashboard
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        if (r.ok) location.href = "/dashboard";
      } catch {}
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
      const url = API ? `${API}/auth/login` : "/api/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // necessário se back usa cookie
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();
      const data = contentType.includes("application/json") ? parseMaybeJson(text) : { raw: text };

      if (!res.ok || data?.ok === false) {
        const msg = data?.error || data?.message || data?.raw || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const next = new URLSearchParams(location.search).get("next") || "/dashboard";
      location.href = next;
    } catch (e:any) {
      setErr(e?.message || "Falha ao entrar (verifique a API e o CORS).");
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
        <div className="text-center space-y-2 mb-6">
          <Brand className="mb-2" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">FETRAF</p>
          <h1 id="login-title" className="text-xl font-semibold">Sistema FETRAF</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Federação dos Trabalhadores do Ramo Financeiro do RJ e ES
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">E-mail</label>
            <input
              id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
              autoComplete="username" inputMode="email"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">Senha</label>
            <input
              id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {err && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-400/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
            {err}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-4 py-2 text-sm transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400" />
            <Link href="/login/reset" className="text-sm underline underline-offset-4 hover:opacity-90">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} FETRAF — Todos os direitos reservados
        </p>
      </form>
    </div>
  );
}
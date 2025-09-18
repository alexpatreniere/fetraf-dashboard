"use client";

import { useState } from "react";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch { data = { raw }; }

      if (!res.ok || !data?.ok) {
        const msg = data?.error || data?.message || data?.raw || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      setOk(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md card p-8">
        {/* Topo */}
        <div className="text-center space-y-2 mb-6">
          <picture>
            <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
            <img
              src="/logo-light.svg"
              alt="FETRAF"
              className="mx-auto h-10 w-auto"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/favicon.ico")}
            />
          </picture>
          <h1 className="text-xl font-semibold">Recuperar acesso</h1>
          <p className="text-sm text-neutral-500">
            Informe seu e-mail. Enviaremos um link para redefinir a senha.
          </p>
        </div>

        {/* Form */}
        {!ok ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-1">
                E-mail
              </label>
              <input
                id="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                required
              />
            </div>

            {err && (
              <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {err}
              </div>
            )}

            <button disabled={loading} className="btn-brand w-full !text-white">
              {loading ? "Enviando..." : "Enviar link"}
            </button>

            <div className="text-center">
              <a href="/login" className="text-sm underline underline-offset-4">
                Voltar ao login
              </a>
            </div>
          </form>
        ) : (
          /* Sucesso */
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
              Se o e-mail existir, um link de redefinição foi enviado.
              <br />
              (Em desenvolvimento, o link aparece no console do servidor.)
            </div>
            <a href="/login" className="btn w-full">Ir para o login</a>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} FETRAF — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Validação simples
  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;

  useEffect(() => {
    if (!token) setErr("Token ausente.");
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    setOk(false);

    if (tooShort) return setErr("A senha deve ter no mínimo 8 caracteres.");
    if (mismatch) return setErr("As senhas não conferem.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch { data = { raw }; }

      if (!res.ok || !data?.ok) {
        const msg = data?.error || data?.message || data?.raw || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      setOk(true);
      // encaminha pro login depois de alguns segundos
      setTimeout(() => router.push("/login"), 1800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Pequeno medidor de força (muito básico, só para feedback)
  const strength =
    (/\d/.test(password) ? 1 : 0) +
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0) +
    (password.length >= 12 ? 1 : 0);
  const strengthLabel =
    strength <= 2 ? "fraca" : strength === 3 ? "média" : "forte";

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
          <h1 className="text-xl font-semibold">Definir nova senha</h1>
          <p className="text-sm text-neutral-500">Crie uma senha segura para sua conta.</p>
        </div>

        {!ok ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm mb-1">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="input w-full pr-20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline underline-offset-4"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {password && (
                <p className={`mt-1 text-xs ${tooShort ? "text-rose-400" : "text-neutral-500"}`}>
                  Força: <b className="capitalize">{strengthLabel}</b> • mínimo 8 caracteres
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm mb-1">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type="password"
                className="input w-full"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {mismatch && (
                <p className="mt-1 text-xs text-rose-400">As senhas não conferem.</p>
              )}
            </div>

            {err && (
              <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {err}
              </div>
            )}

            <button disabled={loading} className="btn-brand w-full !text-white">
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>

            <div className="text-center">
              <a href="/login" className="text-sm underline underline-offset-4">
                Voltar ao login
              </a>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
              Senha atualizada com sucesso. Redirecionando para o login…
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

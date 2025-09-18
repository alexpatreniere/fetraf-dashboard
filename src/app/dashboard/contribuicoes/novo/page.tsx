"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

export default function NovaContribuicaoPage() {
  const router = useRouter();

  // Campos mínimos (deixe IDs como texto para tolerar variações de backend)
  const [filiadoId, setFiliadoId] = useState("");
  const [sindicatoId, setSindicatoId] = useState("");
  const [competencia, setCompetencia] = useState(""); // AAAA-MM
  const [valor, setValor] = useState<number | string>("");
  const [status, setStatus] = useState<"Pendente" | "Pago" | "Em Atraso" | "Cancelado">("Pendente");

  // Campos opcionais
  const [emailCobranca, setEmailCobranca] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function parseValor(v: string | number) {
    if (typeof v === "number") return v;
    const clean = v.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!filiadoId.trim()) {
      setErr("Informe o ID do filiado.");
      return;
    }
    if (!competencia.trim()) {
      setErr("Informe a competência (AAAA-MM).");
      return;
    }

    const valorNumber = parseValor(valor || 0);

    setLoading(true);
    try {
      const payload = {
        filiadoId: filiadoId.trim(),
        sindicatoId: sindicatoId.trim() || undefined,
        competencia: competencia.trim(),
        valor: valorNumber,
        status,
        emailCobranca: emailCobranca.trim() || undefined,
      };

      const res = await fetch("/api/contribuicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let body: any;
      try { body = JSON.parse(raw); } catch { body = { raw }; }

      if (!res.ok) {
        throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      }

      const id =
        body?.id ??
        body?.data?.id ??
        body?.contribuicao?.id ??
        body?.result?.id;

      setMsg("Contribuição criada com sucesso.");
      if (id != null) {
        router.replace(`/dashboard/contribuicoes/${id}`);
      } else {
        router.replace("/dashboard/contribuicoes");
      }
    } catch (e: any) {
      setErr(e.message ?? "Falha ao criar contribuição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <PageHeader
        title="Nova Contribuição"
        subtitle="Cadastro e emissão"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.push("/dashboard/contribuicoes")}>
              Cancelar
            </button>
            <button form="form-nova-contrib" className="btn-brand" disabled={loading}>
              {loading ? "Salvando…" : "Salvar"}
            </button>
          </div>
        }
      />

      {err && <div className="card border-danger text-danger mb-3">{err}</div>}
      {msg && <div className="card border-[color-mix(in_oklch,var(--brand),black_14%)] mb-3">{msg}</div>}

      <form id="form-nova-contrib" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold">Informações da contribuição</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm muted">Filiado (ID) *</label>
              <input
                className="input"
                value={filiadoId}
                onChange={(e) => setFiliadoId(e.target.value)}
                placeholder="ex.: 123"
              />
            </div>

            <div>
              <label className="text-sm muted">Sindicato (ID)</label>
              <input
                className="input"
                value={sindicatoId}
                onChange={(e) => setSindicatoId(e.target.value)}
                placeholder="opcional"
              />
            </div>

            <div>
              <label className="text-sm muted">Competência (AAAA-MM) *</label>
              <input
                className="input"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                placeholder="2025-02"
              />
            </div>

            <div>
              <label className="text-sm muted">Valor (R$)</label>
              <input
                className="input"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="ex.: 25,00"
              />
            </div>

            <div>
              <label className="text-sm muted">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Em Atraso">Em Atraso</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="text-sm muted">E-mail para cobrança</label>
              <input
                className="input"
                value={emailCobranca}
                onChange={(e) => setEmailCobranca(e.target.value)}
                placeholder="opcional"
              />
            </div>
          </div>
        </section>

        <section className="card space-y-3">
          <h2 className="text-base font-semibold">Ações</h2>
          <p className="text-sm muted">
            Após salvar, você poderá enviar cobrança, emitir boleto/PIX e acompanhar pagamentos na página de detalhes.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={() => router.push("/dashboard/contribuicoes")}>
              Voltar
            </button>
            <button type="submit" className="btn-brand" disabled={loading}>
              {loading ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </section>
      </form>
    </PageLayout>
  );
}

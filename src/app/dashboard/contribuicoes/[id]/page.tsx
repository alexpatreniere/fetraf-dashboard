"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Payment = {
  id: string | number;
  valor?: number;
  data?: string;
  metodo?: string;
  status?: string;
};

type HistoryEvent = {
  id?: string | number;
  tipo?: string;
  descricao?: string;
  data?: string;
  por?: string;
};

type Contrib = {
  id: string | number;
  filiado?: { id: string | number; nome: string; cpf?: string; email?: string } | null;
  sindicato?: { id: string | number; nome: string } | string | null;
  competencia?: string;
  valor?: number;
  status?: "Pendente" | "Pago" | "Em Atraso" | "Cancelado" | string;
  criadoEm?: string;
  atualizadoEm?: string;
  payments?: Payment[];
  history?: HistoryEvent[];
  boletoUrl?: string;
  pixCopiaECola?: string;
};

type Tab = "resumo" | "pagamentos" | "historico";

const fmtMoney = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-";

export default function ContribDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sp = useSearchParams();

  const id = params?.id;
  const tab = (sp.get("tab") as Tab) || "resumo";

  const [data, setData] = useState<Contrib | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<Tab | null>(null);

  const apiUrl = useMemo(() => `/api/contribuicoes/${encodeURIComponent(String(id))}`, [id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await apiFetch(apiUrl);
        const text = await res.text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text };
        }

        const raw = (body && (body.data || body)) || {};
        const c = raw as any;

        const obj: Contrib = {
          id: c.id != null ? c.id : id,
          filiado: c.filiado || body?.filiado || null,
          sindicato: c.sindicato || body?.sindicato || null,
          competencia: c.competencia || "",
          valor: typeof c.valor === "number" ? c.valor : Number(c.valor || 0),
          status: c.status || "Pendente",
          criadoEm: c.criadoEm || c["created_at"] || undefined,
          atualizadoEm: c.atualizadoEm || c["updated_at"] || undefined,
          payments: Array.isArray(c.payments) ? c.payments : Array.isArray(body?.payments) ? body.payments : [],
          history: Array.isArray(c.history) ? c.history : Array.isArray(body?.history) ? body.history : [],
          boletoUrl: c.boletoUrl || body?.boletoUrl,
          pixCopiaECola: c.pixCopiaECola || body?.pixCopiaECola,
        };

        if (!alive) return;
        setData(obj);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message || "Erro ao carregar.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiUrl, id]);

  function go(next: Tab) {
    const usp = new URLSearchParams(sp.toString());
    usp.set("tab", next);
    router.push(`/dashboard/contribuicoes/${id}?${usp.toString()}`);
  }

  async function patch(payload: any, which: Tab | null = null) {
    setSaving(which);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let body: any;
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
      if (!res.ok) throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      setMsg("Atualizado com sucesso.");
    } catch (e: any) {
      setErr(e.message || "Falha na operação.");
    } finally {
      setSaving(null);
    }
  }

  async function marcarPago() {
    await patch({ status: "Pago" }, "resumo");
    setData((v) => (v ? { ...v, status: "Pago" } : v));
  }
  async function cancelar() {
    await patch({ status: "Cancelado" }, "resumo");
    setData((v) => (v ? { ...v, status: "Cancelado" } : v));
  }
  async function reenviarCobranca() {
    await patch({ action: "reenviar_cobranca" }, "resumo");
  }

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString("pt-BR") : "-");

  return (
    <PageLayout>
      <PageHeader
        title={loading ? "Carregando…" : `Contribuição #${data ? data.id : ""}`}
        subtitle="Resumo e histórico"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.push("/dashboard/contribuicoes")}>
              Voltar
            </button>

            {/* Abrir boleto */}
            <a
              className="btn"
              href={data?.boletoUrl ? data.boletoUrl : "#"}
              target={data?.boletoUrl ? "_blank" : undefined}
              rel={data?.boletoUrl ? "noopener noreferrer" : undefined}
              aria-disabled={!data?.boletoUrl}
            >
              Ver boleto/PDF
            </a>

            <button className="btn" onClick={reenviarCobranca} disabled={Boolean(saving)}>
              {saving === "resumo" ? "Processando..." : "Reenviar cobrança"}
            </button>
            <button className="btn border-danger text-danger" onClick={cancelar} disabled={Boolean(saving)}>
              Cancelar
            </button>
            <button className="btn-brand" onClick={marcarPago} disabled={Boolean(saving) || data?.status === "Pago"}>
              {saving === "resumo" ? "Processando..." : "Marcar como Pago"}
            </button>
          </div>
        }
      />

      <div className="flex gap-2 mb-3">
        <button className={`tab ${tab === "resumo" ? "tab-active" : ""}`} onClick={() => go("resumo")}>
          Resumo
        </button>
        <button className={`tab ${tab === "pagamentos" ? "tab-active" : ""}`} onClick={() => go("pagamentos")}>
          Pagamentos
        </button>
        <button className={`tab ${tab === "historico" ? "tab-active" : ""}`} onClick={() => go("historico")}>
          Histórico
        </button>
      </div>

      {err && <div className="card border-danger text-danger mb-3">{err}</div>}
      {msg && <div className="card border-[color-mix(in_oklch,var(--brand),black_14%)] mb-3">{msg}</div>}

      {loading ? (
        <div className="card">Carregando…</div>
      ) : tab === "resumo" ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card space-y-3 lg:col-span-2">
            <h2 className="text-base font-semibold">Informações</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm muted">Filiado</p>
                <p className="text-sm">
                  {data?.filiado?.nome ?? "-"}
                  {data?.filiado?.cpf ? <span className="muted"> • {data.filiado.cpf}</span> : null}
                </p>
              </div>
              <div>
                <p className="text-sm muted">Sindicato</p>
                <p className="text-sm">
                  {typeof data?.sindicato === "string" ? (data?.sindicato as string) : (data?.sindicato as any)?.nome ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm muted">Competência</p>
                <p className="text-sm">{data?.competencia ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm muted">Valor</p>
                <p className="text-sm">{fmtMoney(data?.valor)}</p>
              </div>
              <div>
                <p className="text-sm muted">Status</p>
                <p className="text-sm">
                  <span
                    className={
                      "chip " +
                      (data?.status === "Pago"
                        ? "border-emerald-300"
                        : data?.status === "Pendente"
                        ? "border-amber-300"
                        : data?.status === "Em Atraso"
                        ? "border-rose-300"
                        : data?.status === "Cancelado"
                        ? "border-[color-mix(in_oklch,var(--fg),transparent_70%)]"
                        : "")
                    }
                  >
                    {data?.status ?? "-"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm muted">Criado</p>
                <p className="text-sm">{fmtDate(data?.criadoEm)}</p>
              </div>
              <div>
                <p className="text-sm muted">Atualizado</p>
                <p className="text-sm">{fmtDate(data?.atualizadoEm)}</p>
              </div>
            </div>

            {data?.pixCopiaECola ? (
              <div className="mt-2">
                <p className="text-sm muted mb-1">PIX (copia e cola)</p>
                <textarea className="input" rows={2} readOnly value={data.pixCopiaECola} />
              </div>
            ) : null}
          </div>

          <div className="card space-y-3">
            <h2 className="text-base font-semibold">Ações rápidas</h2>
            <div className="flex flex-col gap-2">
              <button className="btn" onClick={reenviarCobranca} disabled={Boolean(saving)}>
                Reenviar cobrança ao filiado
              </button>
              <a
                className="btn"
                href={data?.boletoUrl ? data.boletoUrl : "#"}
                target={data?.boletoUrl ? "_blank" : undefined}
                rel={data?.boletoUrl ? "noopener noreferrer" : undefined}
                aria-disabled={!data?.boletoUrl}
              >
                Abrir boleto/PDF
              </a>
              <button className="btn border-danger text-danger" onClick={cancelar} disabled={Boolean(saving)}>
                Cancelar cobrança
              </button>
              <button className="btn-brand" onClick={marcarPago} disabled={Boolean(saving) || data?.status === "Pago"}>
                Marcar como Pago
              </button>
            </div>
          </div>
        </section>
      ) : tab === "pagamentos" ? (
        <section className="card p-0 overflow-x-auto">
          {!data?.payments || data.payments.length === 0 ? (
            <div className="p-6 text-sm muted">Nenhum pagamento encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Data</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Método</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Status</th>
                  <th className="py-2.5 px-2 text-right font-medium border-b border-[var(--border)]">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={String(p.id)} className="border-b border-[var(--border)]">
                    <td className="py-2.5 px-2">{p.data ? new Date(p.data).toLocaleString("pt-BR") : "-"}</td>
                    <td className="py-2.5 px-2">{p.metodo || "-"}</td>
                    <td className="py-2.5 px-2">{p.status || "-"}</td>
                    <td className="py-2.5 px-2 text-right">{fmtMoney(p.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : (
        <section className="card p-0 overflow-x-auto">
          {!data?.history || data.history.length === 0 ? (
            <div className="p-6 text-sm muted">Sem eventos no histórico.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Data</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Evento</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Descrição</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Por</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h, i) => (
                  <tr key={String(h.id ?? i)} className="border-b border-[var(--border)]">
                    <td className="py-2.5 px-2">{h.data ? new Date(h.data).toLocaleString("pt-BR") : "-"}</td>
                    <td className="py-2.5 px-2">{h.tipo || "-"}</td>
                    <td className="py-2.5 px-2">{h.descricao || "-"}</td>
                    <td className="py-2.5 px-2">{h.por || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </PageLayout>
  );
}

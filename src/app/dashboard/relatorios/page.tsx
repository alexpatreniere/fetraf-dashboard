"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

// (opcional) componentes compartilhados
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type KPIs = {
  totalFiliados?: number;
  ativos?: number;
  contribMes?: number;       // valor em centavos ou reais? (tratamos como número)
  inadimplenciaPct?: number; // 0–100
};

type Linha = {
  sindicato?: string;
  filiados?: number;
  ativos?: number;
  contribMes?: number;
  inadimplenciaPct?: number;
};

export default function RelatoriosPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // Filtros básicos
  const start = sp.get("start") ?? ""; // ISO (yyyy-mm-dd)
  const end = sp.get("end") ?? "";
  const sind = sp.get("sindicato") ?? "";

  const [filters, setFilters] = useState({ start, end, sind });
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const usp = new URLSearchParams();
    if (filters.start) usp.set("start", filters.start);
    if (filters.end) usp.set("end", filters.end);
    if (filters.sind) usp.set("sindicato", filters.sind);
    return usp.toString();
  }, [filters]);

  const apiUrl = useMemo(() => {
    const usp = new URLSearchParams();
    if (start) usp.set("start", start);
    if (end) usp.set("end", end);
    if (sind) usp.set("sindicato", sind);
    return `/api/relatorios?${usp.toString()}`;
  }, [start, end, sind]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch(apiUrl);
        const text = await res.text();
        let body: any;
        try { body = JSON.parse(text); } catch { body = { raw: text }; }

        // Tenta estruturas comuns: {kpis, linhas}, {data: {kpis, linhas}}, etc.
        const root = body?.data ?? body ?? {};
        const k: KPIs = root?.kpis ?? root ?? {};
        const l: Linha[] = (Array.isArray(root?.linhas) && root.linhas) ||
                           (Array.isArray(root?.rows) && root.rows) ||
                           [];

        if (!alive) return;
        setKpis({
          totalFiliados: toNumber(k.totalFiliados),
          ativos: toNumber(k.ativos),
          contribMes: toNumber(k.contribMes),
          inadimplenciaPct: toNumber(k.inadimplenciaPct),
        });
        setLinhas(l.map((r) => ({
          sindicato: r.sindicato ?? "-",
          filiados: toNumber(r.filiados),
          ativos: toNumber(r.ativos),
          contribMes: toNumber(r.contribMes),
          inadimplenciaPct: toNumber(r.inadimplenciaPct),
        })));
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message ?? "Erro ao carregar.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiUrl]);

  function pushQuery(next: Partial<{ start: string; end: string; sindicato: string }>) {
    const usp = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) usp.delete(k);
      else usp.set(k, v);
    });
    router.push(`/dashboard/relatorios${usp.toString() ? `?${usp}` : ""}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({
      start: filters.start || "",
      end: filters.end || "",
      sindicato: filters.sind || "",
    });
  }

  const headCell = (label: string) => (
    <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)] muted">
      {label}
    </th>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Relatórios"
        subtitle="Visão consolidada por período"
        actions={
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <input
              type="date"
              className="input"
              value={filters.start}
              onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))}
              placeholder="Início"
            />
            <input
              type="date"
              className="input"
              value={filters.end}
              onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))}
              placeholder="Fim"
            />
            <input
              className="input"
              placeholder="Sindicato (opcional)"
              value={filters.sind}
              onChange={(e) => setFilters((f) => ({ ...f, sind: e.target.value }))}
            />
            <button className="btn">Filtrar</button>
            <a
              href={`/api/relatorios/export?${qs}`}
              className="btn-brand"
              target="_blank"
              rel="noopener noreferrer"
              title="Exportar CSV"
            >
              Exportar
            </a>
          </form>
        }
      />

      {/* Status */}
      {loading && <div className="card p-4 text-sm muted">Carregando…</div>}
      {err && !loading && <div className="card p-4 text-sm text-rose-500">Erro: {err}</div>}

      {/* KPIs */}
      {!loading && !err && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total de filiados" value={fmtNum(kpis?.totalFiliados)} />
          <KpiCard label="Ativos" value={fmtNum(kpis?.ativos)} />
          <KpiCard label="Contribuições (mês)" value={fmtMoeda(kpis?.contribMes)} />
          <KpiCard label="Inadimplência" value={fmtPct(kpis?.inadimplenciaPct)} />
        </section>
      )}

      {/* Tabela por sindicato */}
      {!loading && !err && (
        <div className="card p-0 overflow-x-auto">
          {linhas.length === 0 ? (
            <div className="p-6 text-sm muted">Nenhum dado para o período selecionado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[color-mix(in_oklch,var(--surface),black_4%)]">
                <tr>
                  {headCell("Sindicato")}
                  {headCell("Filiados")}
                  {headCell("Ativos")}
                  {headCell("Contribuições (mês)")}
                  {headCell("Inadimplência")}
                </tr>
              </thead>
              <tbody>
                {linhas.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[color-mix(in_oklch,var(--surface),black_4%)]">
                    <td className="py-2.5 px-2">{r.sindicato ?? "-"}</td>
                    <td className="py-2.5 px-2">{fmtNum(r.filiados)}</td>
                    <td className="py-2.5 px-2">{fmtNum(r.ativos)}</td>
                    <td className="py-2.5 px-2">{fmtMoeda(r.contribMes)}</td>
                    <td className="py-2.5 px-2">{fmtPct(r.inadimplenciaPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </PageLayout>
  );
}

/* ====== Helpers ====== */
function toNumber(v: any): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function fmtNum(v?: number) {
  return v == null ? "-" : v.toLocaleString("pt-BR");
}
function fmtMoeda(v?: number) {
  if (v == null) return "-";
  // ajuste aqui se sua API vier em centavos:
  // return (v/100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtPct(v?: number) {
  return v == null ? "-" : `${v.toFixed(1)}%`;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

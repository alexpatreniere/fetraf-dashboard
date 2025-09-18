"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

/** Tipos (ajuste aos seus campos) */
type Kpis = {
  totalFiliados: number;
  ativos: number;
  inadimplentes: number;
  contribMesQtd: number;
  contribMesValor: number;
  ticketMedio?: number;
};
type UltimoFiliado = { id: string | number; nome: string; cpf?: string; criadoEm?: string; status?: string };
type UltimaContrib = { id: string | number; filiadoId?: string | number; filiado?: string; competencia?: string; valor?: number; status?: string; criadoEm?: string };
type SerieMes = { label: string; valor: number }; // ex.: [{ label: "Mai/25", valor: 1234 }]

function money(v?: number) {
  return v == null ? "–" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** ===== Mini gráfico de barras (SVG, responsivo) ===== */
function MiniBarChart({ data, height = 120 }: { data: SerieMes[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.valor || 0));
  const barW = 28; // largura de cada barra
  const gap = 12;  // espaçamento entre barras
  const w = data.length * barW + (data.length - 1) * gap;
  const h = height;
  const base = h - 24; // deixa espaço para labels

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]" aria-label="Contribuições - últimos meses">
      {/* eixo base */}
      <line x1={0} y1={base} x2={w} y2={base} stroke="currentColor" className="opacity-20" />
      {data.map((d, i) => {
        const x = i * (barW + gap);
        const barH = max ? Math.max(2, Math.round((d.valor / max) * (base - 8))) : 2;
        const y = base - barH;
        return (
          <g key={i} transform={`translate(${x},0)`}>
            {/* barra */}
            <rect
              x={0}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              className="fill-[var(--brand)]/80 hover:fill-[var(--brand)] transition"
            >
              <title>{`${d.label}: ${money(d.valor)}`}</title>
            </rect>
            {/* valor (minitexto) */}
            <text
              x={barW / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-current text-[10px] opacity-70"
            >
              {d.valor?.toLocaleString("pt-BR")}
            </text>
            {/* label mês */}
            <text
              x={barW / 2}
              y={h - 6}
              textAnchor="middle"
              className="fill-current text-[10px] opacity-60"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardHome() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [topLoading, setTopLoading] = useState(true);
  const [topErr, setTopErr] = useState<string | null>(null);

  const [ultFiliados, setUltFiliados] = useState<UltimoFiliado[]>([]);
  const [ultContribs, setUltContribs] = useState<UltimaContrib[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsErr, setListsErr] = useState<string | null>(null);

  // Série do gráfico
  const [serie, setSerie] = useState<SerieMes[] | null>(null);
  const [serieErr, setSerieErr] = useState<string | null>(null);

  /** Endpoints sugeridos (ajuste se necessário) */
  const kpiUrl = useMemo(() => `/api/dashboard/summary`, []);
  const ultFiliadosUrl = useMemo(() => `/api/filiados?sort=criadoEm&dir=desc&limit=8`, []);
  const ultContribsUrl = useMemo(() => `/api/contribuicoes?sort=criadoEm&dir=desc&limit=8`, []);
  // Endpoint da série (ajuste ao seu backend). Esperado: array simples ou {data: []}
  const serieUrl = useMemo(() => `/api/contribuicoes/series?months=6&group=mes`, []);

  /** KPIs / cards superiores */
  useEffect(() => {
    let alive = true;
    (async () => {
      setTopLoading(true);
      setTopErr(null);
      try {
        const res = await apiFetch(kpiUrl);
        const txt = await res.text();
        let body: any; try { body = JSON.parse(txt); } catch { body = { raw: txt }; }
        const s: Kpis = body?.data ?? body ?? {};
        if (!alive) return;
        setKpis({
          totalFiliados: Number(s.totalFiliados ?? 0),
          ativos: Number(s.ativos ?? 0),
          inadimplentes: Number(s.inadimplentes ?? 0),
          contribMesQtd: Number(s.contribMesQtd ?? 0),
          contribMesValor: Number(s.contribMesValor ?? 0),
          ticketMedio: s.ticketMedio ?? (Number(s.contribMesQtd) ? Number(s.contribMesValor) / Number(s.contribMesQtd) : undefined),
        });
      } catch (e: any) {
        if (!alive) return;
        setTopErr(e.message ?? "Falha ao carregar resumo.");
      } finally {
        if (!alive) return;
        setTopLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [kpiUrl]);

  /** Listas inferiores (últimos cadastros e contribuições) */
  useEffect(() => {
    let alive = true;
    (async () => {
      setListsLoading(true);
      setListsErr(null);
      try {
        const [rf, rc] = await Promise.all([apiFetch(ultFiliadosUrl), apiFetch(ultContribsUrl)]);
        const [tf, tc] = await Promise.all([rf.text(), rc.text()]);
        let bf: any; try { bf = JSON.parse(tf); } catch { bf = { raw: tf }; }
        let bc: any; try { bc = JSON.parse(tc); } catch { bc = { raw: tc }; }

        const lf: UltimoFiliado[] =
          (Array.isArray(bf) && bf) || bf?.data || bf?.items || [];
        const lc: UltimaContrib[] =
          (Array.isArray(bc) && bc) || bc?.data || bc?.items || [];

        if (!alive) return;
        setUltFiliados(lf);
        setUltContribs(lc);
      } catch (e: any) {
        if (!alive) return;
        setListsErr(e.message ?? "Falha ao carregar listas.");
      } finally {
        if (!alive) return;
        setListsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [ultFiliadosUrl, ultContribsUrl]);

  /** Série do gráfico (últimos 6 meses) */
  useEffect(() => {
    let alive = true;
    (async () => {
      setSerieErr(null);
      try {
        const res = await apiFetch(serieUrl);
        const txt = await res.text();
        let body: any; try { body = JSON.parse(txt); } catch { body = { raw: txt }; }
        const arr: any[] = (Array.isArray(body) && body) || body?.data || body?.items || [];

        // Normaliza possíveis formatos de backend:
        // aceita { mes: "2025-05", totalValor: 123 }, { label, valor }, etc.
        const norm: SerieMes[] = arr.map((it) => {
          const rawLabel: string =
            it.label ??
            it.mes ??
            it.month ??
            it.periodo ??
            it.period ??
            "";
          const label =
            rawLabel && /^\d{4}-\d{2}/.test(rawLabel)
              ? new Date(rawLabel + "-01T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") + "/" + new Date(rawLabel + "-01T00:00:00").getFullYear().toString().slice(-2)
              : (rawLabel || "");
          const valor: number =
            Number(it.valor ?? it.total ?? it.totalValor ?? it.sum ?? 0);
          return { label, valor };
        });

        if (!alive) return;
        setSerie(norm);
      } catch (e: any) {
        if (!alive) return;
        setSerieErr(e.message ?? "Falha ao carregar série.");
      }
    })();
    return () => { alive = false; };
  }, [serieUrl]);

  return (
    <PageLayout>
      <PageHeader
        title="Visão geral"
        subtitle="Resumo operacional do Sistema FETRAF"
        actions={
          <div className="flex items-center gap-2">
            <a href="/dashboard/filiados/novo" className="btn btn-brand">Novo Filiado</a>
            <a href="/dashboard/contribuicoes/nova" className="btn">Nova Contribuição</a>
          </div>
        }
      />

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Filiados"
          value={topLoading ? "…" : kpis?.totalFiliados?.toLocaleString("pt-BR") ?? "0"}
          foot={topErr ? topErr : `Ativos: ${kpis?.ativos ?? 0}`}
          href="/dashboard/filiados"
        />
        <KpiCard
          title="Inadimplentes"
          value={topLoading ? "…" : (kpis?.inadimplentes ?? 0).toLocaleString("pt-BR")}
          foot="Nos últimos 12 meses"
          href="/dashboard/filiados?q=status:inadimplente"
        />
        <KpiCard
          title="Contribuições (mês)"
          value={topLoading ? "…" : (kpis?.contribMesQtd ?? 0).toLocaleString("pt-BR")}
          foot={money(kpis?.contribMesValor)}
          href="/dashboard/contribuicoes"
        />
        <KpiCard
          title="Ticket médio"
          value={topLoading ? "…" : money(kpis?.ticketMedio)}
          foot="Valor médio por contribuição"
          href="/dashboard/relatorios"
        />
      </section>

      {/* Mini gráfico */}
      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Contribuições — últimos 6 meses</h3>
            {serieErr && <span className="text-xs text-rose-500">{serieErr}</span>}
          </div>
          <p className="mt-1 text-xs muted">
            Soma mensal (R$). Passe o mouse nas barras para ver os valores.
          </p>
          <div className="mt-2">
            {serie?.length ? (
              <MiniBarChart data={serie} />
            ) : (
              <div className="text-sm muted">Carregando série…</div>
            )}
          </div>
        </div>

        {/* Pequeno resumo ao lado do gráfico (facultativo) */}
        <div className="card space-y-2">
          <h4 className="font-medium">Resumo rápido</h4>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span className="muted">Média mensal</span>
              <span>
                {serie && serie.length
                  ? money(
                      Math.round(
                        (serie.reduce((s, p) => s + (p.valor || 0), 0) / serie.length) * 100
                      ) / 100
                    )
                  : "–"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="muted">Maior mês</span>
              <span>
                {serie && serie.length
                  ? (() => {
                      const top = [...serie].sort((a, b) => b.valor - a.valor)[0];
                      return `${top.label} · ${money(top.valor)}`;
                    })()
                  : "–"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="muted">Menor mês</span>
              <span>
                {serie && serie.length
                  ? (() => {
                      const low = [...serie].sort((a, b) => a.valor - b.valor)[0];
                      return `${low.label} · ${money(low.valor)}`;
                    })()
                  : "–"}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Tabelas rápidas */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Últimos filiados */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-medium">Últimos filiados</h3>
            <a className="text-sm hover:underline" href="/dashboard/filiados">ver todos</a>
          </div>
          {listsLoading ? (
            <div className="px-4 pb-4 text-sm muted">Carregando…</div>
          ) : listsErr ? (
            <div className="px-4 pb-4 text-sm text-rose-500">Erro: {listsErr}</div>
          ) : ultFiliados.length === 0 ? (
            <div className="px-4 pb-4 text-sm muted">Sem cadastros recentes.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Nome</th>
                  <th className="px-3 py-2 text-left font-medium">CPF</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {ultFiliados.map((f) => (
                  <tr key={f.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      <a className="hover:underline" href={`/dashboard/filiados/${f.id}`}>{f.nome}</a>
                    </td>
                    <td className="px-3 py-2">{f.cpf ?? "-"}</td>
                    <td className="px-3 py-2">
                      <span className="chip">{f.status ?? "-"}</span>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      {f.criadoEm ? new Date(f.criadoEm).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Últimas contribuições */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-medium">Últimas contribuições</h3>
            <a className="text-sm hover:underline" href="/dashboard/contribuicoes">ver todas</a>
          </div>
          {listsLoading ? (
            <div className="px-4 pb-4 text-sm muted">Carregando…</div>
          ) : listsErr ? (
            <div className="px-4 pb-4 text-sm text-rose-500">Erro: {listsErr}</div>
          ) : ultContribs.length === 0 ? (
            <div className="px-4 pb-4 text-sm muted">Sem lançamentos recentes.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Filiado</th>
                  <th className="px-3 py-2 text-left font-medium">Competência</th>
                  <th className="px-3 py-2 text-left font-medium">Valor</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {ultContribs.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      {c.filiadoId ? (
                        <a className="hover:underline" href={`/dashboard/filiados/${c.filiadoId}?tab=contribuicoes`}>
                          {c.filiado ?? c.filiadoId}
                        </a>
                      ) : (
                        c.filiado ?? "-"
                      )}
                    </td>
                    <td className="px-3 py-2">{c.competencia ?? "-"}</td>
                    <td className="px-3 py-2">{money(c.valor)}</td>
                    <td className="px-3 py-2"><span className="chip">{c.status ?? "-"}</span></td>
                    <td className="px-3 py-2 text-neutral-500">
                      {c.criadoEm ? new Date(c.criadoEm).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

/** ===== Componente de KPI ===== */
function KpiCard({ title, value, foot, href }: { title: string; value: string; foot?: string; href?: string }) {
  const content = (
    <div className="card">
      <p className="text-xs muted">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {foot && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{foot}</p>}
    </div>
  );
  return href ? (
    <a href={href} className="block transition hover:-translate-y-0.5">{content}</a>
  ) : content;
}

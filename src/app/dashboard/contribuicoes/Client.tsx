// src/app/dashboard/contribuicoes/Client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Contribuicao = {
  id: string | number;
  sindicato?: string;
  periodo?: string;       // ex.: "2025-08" ou "08/2025"
  competencia?: string;   // alias
  status?: string;        // "Paga" | "Em aberto" | ...
  valor?: number | string;
  vencimento?: string;    // ISO
};

type Dir = "asc" | "desc";

function safeStr(v: any) {
  return (v ?? "").toString();
}
function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function cmp(a: any, b: any, dir: Dir) {
  if (a === b) return 0;
  const r = a > b ? 1 : -1;
  return dir === "asc" ? r : -r;
}
function compareBy(field: keyof Contribuicao, dir: Dir) {
  return (a: Contribuicao, b: Contribuicao) => {
    if (field === "vencimento") {
      const da = a.vencimento ? Date.parse(a.vencimento) : 0;
      const db = b.vencimento ? Date.parse(b.vencimento) : 0;
      return cmp(da, db, dir);
    }
    if (field === "valor") {
      return cmp(toNumber(a.valor), toNumber(b.valor), dir);
    }
    // periodo/competencia: tenta normalizar YYYY-MM
    const norm = (s?: string) => {
      const t = (s ?? "").trim();
      if (/^\d{4}-\d{2}$/.test(t)) return t;
      const m = t.match(/^(\d{2})\/(\d{4})$/); // MM/YYYY -> YYYY-MM
      if (m) return `${m[2]}-${m[1]}`;
      return t;
    };
    if (field === "periodo" || field === "competencia") {
      return safeStr(norm((a.periodo ?? a.competencia) as string)).localeCompare(
        safeStr(norm((b.periodo ?? b.competencia) as string)),
        "pt-BR",
        { sensitivity: "base" }
      ) * (dir === "asc" ? 1 : -1);
    }
    return (
      safeStr(a[field]).localeCompare(safeStr(b[field]), "pt-BR", { sensitivity: "base" }) *
      (dir === "asc" ? 1 : -1)
    );
  };
}

export default function ContribuicoesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filtros via URL
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 10) || 10);
  const sort = (searchParams.get("sort") as keyof Contribuicao) || "periodo";
  const dir: Dir = (searchParams.get("dir") as Dir) === "desc" ? "desc" : "asc";

  const [query, setQuery] = useState(q);

  const [data, setData] = useState<Contribuicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Metadados opcionais
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean | undefined>(undefined);

  // Endpoint do proxy (API interna)
  const apiUrl = useMemo(() => {
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    usp.set("page", String(page));
    usp.set("limit", String(limit));
    usp.set("sort", sort);
    usp.set("dir", dir);
    return `/api/contribuicoes?${usp.toString()}`;
  }, [q, page, limit, sort, dir]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch(apiUrl);
        const text = await res.text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text };
        }

        const list: Contribuicao[] =
          (Array.isArray(body) && body) ||
          (Array.isArray(body.data) && body.data) ||
          (Array.isArray(body.items) && body.items) ||
          [];

        const metaTotal =
          body?.total ?? body?.count ?? body?.meta?.total ?? body?.pagination?.total ?? undefined;
        const metaPage = body?.page ?? body?.meta?.page ?? body?.pagination?.page ?? page;
        const metaLimit =
          body?.limit ?? body?.per_page ?? body?.meta?.per_page ?? body?.pagination?.per_page ?? limit;
        const metaHasMore =
          body?.hasMore ??
          body?.meta?.hasMore ??
          (metaTotal != null ? metaPage * metaLimit < metaTotal : list.length === metaLimit);

        // Ordena/pagina no cliente caso o backend não traga metadados
        let finalList = list;
        if (metaTotal == null) {
          finalList = [...list].sort(compareBy(sort, dir));
          const start = (page - 1) * limit;
          finalList = finalList.slice(start, start + limit);
        }

        if (!alive) return;
        setData(finalList);
        setTotal(metaTotal ?? list.length);
        setHasMore(metaHasMore);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message ?? "Erro ao carregar.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiUrl, page, limit, sort, dir]);

  function pushQuery(next: Partial<Record<string, string | number | undefined>>) {
    const usp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === "") usp.delete(k);
      else usp.set(k, String(v));
    }
    router.push(`/dashboard/contribuicoes${usp.toString() ? `?${usp}` : ""}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({ q: query.trim() || undefined, page: 1 });
  }

  function onHeaderClick(field: keyof Contribuicao) {
    const nextDir: Dir = sort === field && dir === "asc" ? "desc" : "asc";
    pushQuery({ sort: field, dir: nextDir, page: 1 });
  }

  const showingFrom = (page - 1) * limit + (data.length ? 1 : 0);
  const showingTo = (page - 1) * limit + data.length;
  const pageCount = total ? Math.max(1, Math.ceil(total / limit)) : undefined;

  const th = (label: string, field: keyof Contribuicao) => (
    <th
      className="py-2.5 px-2 text-left font-medium cursor-pointer select-none border-b border-[var(--border)] text-[var(--muted)]"
      onClick={() => onHeaderClick(field)}
      title={`Ordenar por ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === field && (
          <span aria-hidden className="text-xs">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </span>
    </th>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Contribuições"
        subtitle="Controle e cobrança"
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <form onSubmit={submitSearch} className="flex-1 sm:w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por sindicato, período..."
                className="input"
              />
            </form>

            <select
              value={limit}
              onChange={(e) => pushQuery({ limit: Number(e.target.value), page: 1 })}
              className="input max-w-28"
              title="Itens por página"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/página
                </option>
              ))}
            </select>

            <a href="/dashboard/contribuicoes/nova" className="btn btn-brand">
              Nova Contribuição
            </a>
          </div>
        }
      />

      {/* Tabela */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm muted">Carregando…</div>
        ) : err ? (
          <div className="p-6 text-sm text-[var(--danger)]">Erro: {err}</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-sm muted">Nenhuma contribuição encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-3)]">
              <tr>
                {th("Sindicato", "sindicato")}
                {th("Período", "periodo")}
                {th("Status", "status")}
                {th("Valor", "valor")}
                {th("Vencimento", "vencimento")}
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[var(--surface-3)] border-b border-[var(--border)]"
                >
                  <td className="py-2.5 px-2">
                    <a className="hover:underline" href={`/dashboard/contribuicoes/${c.id}`}>
                      {c.sindicato ?? "-"}
                    </a>
                  </td>
                  <td className="py-2.5 px-2">
                    {c.periodo ?? c.competencia ?? "-"}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="chip">
                      {c.status ?? "-"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    {c.valor != null ? String(c.valor) : "-"}
                  </td>
                  <td className="py-2.5 px-2 muted">
                    {c.vencimento ? new Date(c.vencimento).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs muted">
          {total != null ? (
            <>
              Mostrando <b>{showingFrom || 0}</b>–<b>{showingTo}</b> de <b>{total}</b>
            </>
          ) : (
            <>
              Página <b>{page}</b>
              {pageCount ? (
                <>
                  {" "}
                  de <b>{pageCount}</b>
                </>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn"
            onClick={() => pushQuery({ page: page - 1 })}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <button
            className="btn"
            onClick={() => pushQuery({ page: page + 1 })}
            disabled={hasMore === false || (total != null && pageCount != null && page >= pageCount)}
          >
            Próxima
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

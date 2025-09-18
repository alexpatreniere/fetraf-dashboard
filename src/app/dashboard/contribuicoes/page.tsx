"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Contrib = {
  id: string | number;
  filiado?: { id: string | number; nome: string; cpf?: string };
  sindicato?: string;
  competencia?: string; // AAAA-MM
  valor?: number;
  status?: "Pendente" | "Pago" | "Em Atraso" | "Cancelado" | string;
  criadoEm?: string;
};

type Dir = "asc" | "desc";

function safeStr(v: any) {
  return (v ?? "").toString();
}

function compareBy(field: keyof Contrib, dir: Dir) {
  return (a: Contrib, b: Contrib) => {
    const av =
      field === "criadoEm"
        ? (a.criadoEm ? Date.parse(a.criadoEm) : 0)
        : field === "valor"
        ? Number(a.valor ?? 0)
        : safeStr((a as any)[field]);
    const bv =
      field === "criadoEm"
        ? (b.criadoEm ? Date.parse(b.criadoEm) : 0)
        : field === "valor"
        ? Number(b.valor ?? 0)
        : safeStr((b as any)[field]);

    const r =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "pt-BR", { sensitivity: "base" });

    return dir === "asc" ? r : -r;
  };
}

export default function ContribuicoesPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(sp.get("limit") ?? 10) || 10);
  const sort = (sp.get("sort") as keyof Contrib) || "criadoEm";
  const dir: Dir = (sp.get("dir") as Dir) === "desc" ? "desc" : "asc";

  const [query, setQuery] = useState(q);
  const [data, setData] = useState<Contrib[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean | undefined>(undefined);

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
        const raw = await res.text();
        let body: any;
        try {
          body = JSON.parse(raw);
        } catch {
          body = { raw };
        }

        const list: Contrib[] =
          (Array.isArray(body) && body) ||
          (Array.isArray(body?.data) && body.data) ||
          (Array.isArray(body?.items) && body.items) ||
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

        let final = list;
        if (metaTotal == null) {
          final = [...list].sort(compareBy(sort, dir));
          const start = (page - 1) * limit;
          final = final.slice(start, start + limit);
        }

        if (!alive) return;
        setData(final);
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
    const usp = new URLSearchParams(sp.toString());
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

  function onHeader(field: keyof Contrib) {
    const nextDir: Dir = sort === field && dir === "asc" ? "desc" : "asc";
    pushQuery({ sort: field, dir: nextDir, page: 1 });
  }

  const showingFrom = (page - 1) * limit + (data.length ? 1 : 0);
  const showingTo = (page - 1) * limit + data.length;
  const pageCount = total ? Math.max(1, Math.ceil(total / limit)) : undefined;

  const th = (label: string, field: keyof Contrib) => (
    <th
      className="py-2.5 px-2 text-left font-medium cursor-pointer select-none border-b border-[var(--border)] text-[var(--muted)]"
      onClick={() => onHeader(field)}
      title={`Ordenar por ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === field && <span className="text-xs">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );

  const fmtMoney = (v?: number) =>
    typeof v === "number"
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "-";

  return (
    <PageLayout>
      <PageHeader
        title="Contribuições"
        subtitle="Cobranças e conciliações"
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <form onSubmit={submitSearch} className="flex-1 sm:w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por filiado, competência, status…"
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

            <a href="/dashboard/contribuicoes/novo" className="btn-brand">
              Nova Contribuição
            </a>
          </div>
        }
      />

      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm muted">Carregando…</div>
        ) : err ? (
          <div className="p-6 text-sm text-[var(--danger)]">Erro: {err}</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-sm muted">Nenhuma contribuição encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)]">
              <tr>
                {th("Filiado", "filiado")}
                {th("Competência", "competencia")}
                {th("Sindicato", "sindicato")}
                {th("Valor", "valor")}
                {th("Status", "status")}
                {th("Criado em", "criadoEm")}
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <td className="py-2.5 px-2">
                    <a className="hover:underline" href={`/dashboard/contribuicoes/${c.id}`}>
                      {c.filiado?.nome ?? "-"}
                    </a>
                    {c.filiado?.cpf && <span className="ml-2 text-xs muted">• {c.filiado.cpf}</span>}
                  </td>
                  <td className="py-2.5 px-2">{c.competencia ?? "-"}</td>
                  <td className="py-2.5 px-2">{c.sindicato ?? "-"}</td>
                  <td className="py-2.5 px-2">{fmtMoney(c.valor)}</td>
                  <td className="py-2.5 px-2">
                    <span
                      className={
                        "chip " +
                        (c.status === "Pago"
                          ? "border-emerald-300"
                          : c.status === "Pendente"
                          ? "border-amber-300"
                          : c.status === "Em Atraso"
                          ? "border-rose-300"
                          : c.status === "Cancelado"
                          ? "border-[color-mix(in_oklch,var(--fg),transparent_70%)]"
                          : "")
                      }
                    >
                      {c.status ?? "-"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">
                    {c.criadoEm ? new Date(c.criadoEm).toLocaleDateString("pt-BR") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs muted">
          {total != null ? (
            <>Mostrando <b>{showingFrom || 0}</b>–<b>{showingTo}</b> de <b>{total}</b></>
          ) : (
            <>
              Página <b>{page}</b>
              {pageCount ? <> de <b>{pageCount}</b></> : null}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => pushQuery({ page: page - 1 })} disabled={page <= 1}>
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



// src/app/dashboard/sindicatos/Client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Sindicato = {
  id: string | number;
  nome: string;
  cnpj?: string;
  municipio?: string;
  uf?: string;
  status?: string;
  criado_em?: string; // ISO
};

type Dir = "asc" | "desc";

function safeStr(v: any) {
  return (v ?? "").toString();
}
function cmp(a: any, b: any, dir: Dir) {
  if (a === b) return 0;
  const r = a > b ? 1 : -1;
  return dir === "asc" ? r : -r;
}
function compareBy(field: keyof Sindicato, dir: Dir) {
  return (a: Sindicato, b: Sindicato) => {
    if (field === "criado_em") {
      const da = a.criado_em ? Date.parse(a.criado_em) : 0;
      const db = b.criado_em ? Date.parse(b.criado_em) : 0;
      return cmp(da, db, dir);
    }
    return (
      safeStr(a[field]).localeCompare(safeStr(b[field]), "pt-BR", { sensitivity: "base" }) *
      (dir === "asc" ? 1 : -1)
    );
  };
}

export default function SindicatosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 10) || 10);
  const sort = (searchParams.get("sort") as keyof Sindicato) || "nome";
  const dir: Dir = (searchParams.get("dir") as Dir) === "desc" ? "desc" : "asc";

  const [query, setQuery] = useState(q);

  const [data, setData] = useState<Sindicato[]>([]);
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
    return `/api/sindicatos?${usp.toString()}`;
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

        const list: Sindicato[] =
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
    router.push(`/dashboard/sindicatos${usp.toString() ? `?${usp}` : ""}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({ q: query.trim() || undefined, page: 1 });
  }

  function onHeaderClick(field: keyof Sindicato) {
    const nextDir: Dir = sort === field && dir === "asc" ? "desc" : "asc";
    pushQuery({ sort: field, dir: nextDir, page: 1 });
  }

  const showingFrom = (page - 1) * limit + (data.length ? 1 : 0);
  const showingTo = (page - 1) * limit + data.length;
  const pageCount = total ? Math.max(1, Math.ceil(total / limit)) : undefined;

  const th = (label: string, field: keyof Sindicato) => (
    <th
      className="py-2.5 px-2 text-left font-medium cursor-pointer select-none border-b border-[var(--border)] text-[var(--muted)]"
      onClick={() => onHeaderClick(field)}
      title={`Ordenar por ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === field && <span aria-hidden className="text-xs">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Sindicatos"
        subtitle="Cadastro e manutenção"
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <form onSubmit={submitSearch} className="flex-1 sm:w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, CNPJ…"
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

            <a href="/dashboard/sindicatos/novo" className="btn btn-brand">
              Novo Sindicato
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
          <div className="p-6 text-sm muted">Nenhum sindicato encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-3)]">
              <tr>
                {th("Nome", "nome")}
                {th("CNPJ", "cnpj")}
                {th("Município", "municipio")}
                {th("UF", "uf")}
                {th("Status", "status")}
                {th("Criado em", "criado_em")}
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--surface-3)] border-b border-[var(--border)]">
                  <td className="py-2.5 px-2">
                    <a className="hover:underline" href={`/dashboard/sindicatos/${s.id}`}>{s.nome}</a>
                  </td>
                  <td className="py-2.5 px-2">{s.cnpj ?? "-"}</td>
                  <td className="py-2.5 px-2">{s.municipio ?? "-"}</td>
                  <td className="py-2.5 px-2">{s.uf ?? "-"}</td>
                  <td className="py-2.5 px-2">
                    <span
                      className={
                        "chip " +
                        (s.status === "Ativo"
                          ? "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                          : s.status === "Inativo"
                          ? "border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300"
                          : "")
                      }
                    >
                      {s.status ?? "-"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 muted">
                    {s.criado_em ? new Date(s.criado_em).toLocaleDateString() : "-"}
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
            <>
              Mostrando <b>{showingFrom || 0}</b>–<b>{showingTo}</b> de <b>{total}</b>
            </>
          ) : (
            <>Página <b>{page}</b>{pageCount ? <> de <b>{pageCount}</b></> : null}</>
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

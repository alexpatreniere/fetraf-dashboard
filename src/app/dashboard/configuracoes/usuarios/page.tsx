"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = {
  id: string | number;
  nome: string;
  email: string;
  role?: "admin" | "financeiro" | "analista" | string;
  ativo?: boolean;
  criadoEm?: string;
};

type Dir = "asc" | "desc";
const fmtDate = (d?: string) => !d ? "-" : new Date(d).toLocaleDateString();

export default function UsuariosPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const limit = Math.max(1, Number(sp.get("limit") ?? 10) || 10);
  const sort = (sp.get("sort") as "nome" | "email" | "role" | "criadoEm") || "nome";
  const dir: Dir = (sp.get("dir") as Dir) === "desc" ? "desc" : "asc";

  const [query, setQuery] = useState(q);
  const [data, setData] = useState<User[]>([]);
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
    return `/api/usuarios?${usp.toString()}`;
  }, [q, page, limit, sort, dir]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await apiFetch(apiUrl);
        const text = await res.text();
        let body: any; try { body = JSON.parse(text); } catch { body = { raw:text }; }
        const list: User[] = (Array.isArray(body) && body) || body?.data || body?.items || [];
        const metaTotal = body?.total ?? body?.count ?? body?.meta?.total ?? body?.pagination?.total ?? undefined;
        const metaPage  = body?.page ?? body?.meta?.page ?? body?.pagination?.page ?? page;
        const metaLimit = body?.limit ?? body?.per_page ?? body?.meta?.per_page ?? body?.pagination?.per_page ?? limit;
        const metaHasMore = body?.hasMore ?? body?.meta?.hasMore ?? (metaTotal != null ? metaPage * metaLimit < metaTotal : list.length === metaLimit);

        let final = list;
        if (metaTotal == null) {
          final = [...list].sort((a,b) => {
            const get = (u:User) =>
              sort === "criadoEm" ? (u.criadoEm ? Date.parse(u.criadoEm) : 0)
              : (u as any)[sort] ?? "";
            const va = get(a), vb = get(b);
            const r = (typeof va === "number" && typeof vb === "number")
              ? (va - vb) : String(va).localeCompare(String(vb), "pt-BR", { sensitivity:"base" });
            return dir === "asc" ? r : -r;
          });
          const start = (page - 1) * limit;
          final = final.slice(start, start + limit);
        }

        if (!alive) return;
        setData(final);
        setTotal(metaTotal ?? list.length);
        setHasMore(metaHasMore);
      } catch (e:any) {
        if (!alive) return;
        setErr(e.message);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiUrl, page, limit, sort, dir]);

  function pushQuery(next: Record<string, string | number | undefined>) {
    const usp = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k,v]) => v===undefined||v==="" ? usp.delete(k) : usp.set(k, String(v)));
    router.push(`/dashboard/configuracoes/usuarios${usp.toString() ? `?${usp}` : ""}`);
  }
  function submitSearch(e: React.FormEvent) { e.preventDefault(); pushQuery({ q: query.trim() || undefined, page:1 }); }
  function onHeader(field: "nome" | "email" | "role" | "criadoEm") {
    const nextDir: Dir = sort === field && dir === "asc" ? "desc" : "asc";
    pushQuery({ sort: field, dir: nextDir, page:1 });
  }
  const th = (label:string, field:any) => (
    <th className="px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={()=>onHeader(field)}>
      <span className="inline-flex items-center gap-1">
        {label}{sort===field && <span className="text-xs">{dir==="asc"?"▲":"▼"}</span>}
      </span>
    </th>
  );

  const showingFrom = (page-1)*limit + (data.length?1:0);
  const showingTo   = (page-1)*limit + data.length;
  const pageCount   = total ? Math.max(1, Math.ceil(total/limit)) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Usuários</h1>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <form onSubmit={submitSearch} className="flex-1 sm:w-72">
            <input className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                   placeholder="Buscar por nome ou e-mail…" value={query} onChange={e=>setQuery(e.target.value)} />
          </form>
          <select className="rounded-xl border px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  value={limit} onChange={e=>pushQuery({ limit:Number(e.target.value), page:1 })}>
            {[10,25,50].map(n => <option key={n} value={n}>{n}/página</option>)}
          </select>
          <a href="/dashboard/configuracoes/usuarios/novo"
             className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
            Novo Usuário
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        {loading ? (
          <div className="p-6 text-sm text-neutral-500">Carregando…</div>
        ) : err ? (
          <div className="p-6 text-sm text-rose-500">Erro: {err}</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-sm text-neutral-500">Nenhum usuário encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                {th("Nome","nome")}
                {th("E-mail","email")}
                {th("Papel","role")}
                {th("Criado em","criadoEm")}
              </tr>
            </thead>
            <tbody>
              {data.map(u => (
                <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2"><a className="hover:underline" href={`/dashboard/configuracoes/usuarios/${u.id}`}>{u.nome}</a></td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-xl border px-2 py-1 text-xs">
                      {u.role ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-500">{fmtDate(u.criadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-neutral-500">
          {total != null
            ? <>Mostrando <b>{showingFrom || 0}</b>–<b>{showingTo}</b> de <b>{total}</b></>
            : <>Página <b>{page}</b>{pageCount ? <> de <b>{pageCount}</b></> : null}</>}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                  onClick={()=>pushQuery({ page: page-1 })} disabled={page<=1}>
            Anterior
          </button>
          <button className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                  onClick={()=>pushQuery({ page: page+1 })}
                  disabled={hasMore === false || (total != null && pageCount != null && page >= pageCount)}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

// (opcional) se você criou estes componentes:
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

/** ===== Tipos ===== */
type Settings = {
  orgName?: string;
  timezone?: string;
  language?: string;
  theme?: "auto" | "light" | "dark";
  auth?: { twoFactor?: boolean; sessionDays?: number; allowSelfSignup?: boolean };
  notifications?: { emailFrom?: string; newMember?: boolean; paymentReceived?: boolean };
  integrations?: { apiUrl?: string; webhooksUrl?: string; zapToken?: string; smtpFrom?: string };
  finance?: { provider?: "none" | "gerencianet" | "asaas"; dueDay?: number; finePct?: number; interestPct?: number };
  exportCfg?: { csvDelimiter?: "," | ";"; dateFormat?: "pt-BR" | "iso" };
};

type Tab =
  | "geral"
  | "autenticacao"
  | "notificacoes"
  | "integracoes"
  | "financeiro"
  | "exportacao"
  | "usuarios";

/** ===== Toggle simples ===== */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="h-6 w-10 rounded-full px-1 transition"
      style={{ background: checked ? "oklch(65% 0.14 150)" : "var(--border)" }}
      aria-pressed={checked}
    >
      <span className={`block h-4 w-4 rounded-full bg-white transition transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

/** ===== Página ===== */
export default function ConfiguracoesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = (params.get("tab") as Tab) || "geral";

  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Tab | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "geral", label: "Geral" },
    { key: "autenticacao", label: "Autenticação" },
    { key: "notificacoes", label: "Notificações" },
    { key: "integracoes", label: "Integrações" },
    { key: "financeiro", label: "Financeiro" },
    { key: "exportacao", label: "Exportação" },
    { key: "usuarios", label: "Usuários" },
  ];

  function go(t: Tab) {
    const usp = new URLSearchParams(params.toString());
    usp.set("tab", t);
    router.push(`/dashboard/configuracoes?${usp.toString()}`);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/settings");
        const data = await res.json().catch(async () => ({ raw: await res.text() }));
        const cfg: Settings & { export?: Settings["exportCfg"] } = data?.data ?? data ?? {};

        setS({
          orgName: cfg.orgName ?? "Sistema FETRAF",
          timezone: cfg.timezone ?? "America/Sao_Paulo",
          language: cfg.language ?? "pt-BR",
          theme: (cfg.theme as any) ?? "auto",
          auth: {
            twoFactor: cfg.auth?.twoFactor ?? false,
            sessionDays: cfg.auth?.sessionDays ?? 7,
            allowSelfSignup: cfg.auth?.allowSelfSignup ?? false,
          },
          notifications: {
            emailFrom: cfg.notifications?.emailFrom ?? "",
            newMember: cfg.notifications?.newMember ?? true,
            paymentReceived: cfg.notifications?.paymentReceived ?? true,
          },
          integrations: {
            apiUrl: cfg.integrations?.apiUrl ?? "",
            webhooksUrl: cfg.integrations?.webhooksUrl ?? "",
            zapToken: cfg.integrations?.zapToken ?? "",
            smtpFrom: cfg.integrations?.smtpFrom ?? "",
          },
          finance: {
            provider: cfg.finance?.provider ?? "none",
            dueDay: cfg.finance?.dueDay ?? 10,
            finePct: cfg.finance?.finePct ?? 2,
            interestPct: cfg.finance?.interestPct ?? 1,
          },
          exportCfg: {
            csvDelimiter: (cfg as any).export?.csvDelimiter ?? ";",
            dateFormat: (cfg as any).export?.dateFormat ?? "pt-BR",
          },
        });
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(partial: Partial<Settings> & Record<string, any>, which: Tab) {
    if (!s) return;
    setErr(null);
    setMsg(null);
    setSaving(which);
    try {
      const payload: any = { ...partial };
      if ("exportCfg" in payload) {
        payload.export = payload.exportCfg;
        delete payload.exportCfg;
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let body: any = null;
      try { body = JSON.parse(text); } catch { body = { raw: text }; }
      if (!res.ok) throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      setMsg("Configurações salvas.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="p-4 text-sm muted">Carregando…</div>;
  if (!s) return <div className="p-4">Configuração não disponível.</div>;

  return (
    <PageLayout>
      <PageHeader
        title="Configurações"
        actions={
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => go(t.key)}
                className={`btn ${tab === t.key ? "font-semibold bg-[color-mix(in_oklch,var(--surface),black_6%)]" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {msg && <div className="card p-3 text-sm" style={{ borderColor: "oklch(70% 0.12 150)" }}>✅ {msg}</div>}
      {err && <div className="card p-3 text-sm" style={{ borderColor: "oklch(60% 0.15 30)", color: "oklch(70% 0.2 30)" }}>Erro: {err}</div>}

      {/* ========== GERAl ========== */}
      {tab === "geral" && (
        <section className="card space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Nome da organização" value={s.orgName ?? ""} onChange={(e) => setS({ ...s, orgName: e.target.value })} />
            <input className="input" placeholder="Fuso horário (IANA)" value={s.timezone ?? ""} onChange={(e) => setS({ ...s, timezone: e.target.value })} />
            <select className="input" value={s.language ?? "pt-BR"} onChange={(e) => setS({ ...s, language: e.target.value })}>
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
            <select className="input" value={s.theme ?? "auto"} onChange={(e) => setS({ ...s, theme: e.target.value as any })}>
              <option value="auto">Tema automático</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          <button className="btn" disabled={saving === "geral"} onClick={() => save({ orgName: s.orgName, timezone: s.timezone, language: s.language, theme: s.theme }, "geral")}>
            {saving === "geral" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== AUTENTICAÇÃO ========== */}
      {tab === "autenticacao" && (
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Exigir 2FA</p>
              <p className="text-xs muted">Solicita segundo fator para administradores.</p>
            </div>
            <Toggle checked={!!s.auth?.twoFactor} onChange={(v) => setS({ ...s, auth: { ...s.auth, twoFactor: v } })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Permitir auto-cadastro</p>
              <p className="text-xs muted">Usuários podem criar conta sem convite.</p>
            </div>
            <Toggle checked={!!s.auth?.allowSelfSignup} onChange={(v) => setS({ ...s, auth: { ...s.auth, allowSelfSignup: v } })} />
          </div>
          <div>
            <p className="text-sm font-medium">Dias de sessão</p>
            <input className="input mt-1 w-28" type="number" min={1} value={s.auth?.sessionDays ?? 7} onChange={(e) => setS({ ...s, auth: { ...s.auth, sessionDays: Number(e.target.value) } })} />
          </div>
          <button className="btn" disabled={saving === "autenticacao"} onClick={() => save({ auth: s.auth }, "autenticacao")}>
            {saving === "autenticacao" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== NOTIFICAÇÕES ========== */}
      {tab === "notificacoes" && (
        <section className="card space-y-4">
          <input className="input" placeholder="E-mail remetente (From)" value={s.notifications?.emailFrom ?? ""} onChange={(e) => setS({ ...s, notifications: { ...s.notifications, emailFrom: e.target.value } })} />
          <div className="flex items-center justify-between">
            <p className="text-sm">Avisar quando novo filiado for criado</p>
            <Toggle checked={!!s.notifications?.newMember} onChange={(v) => setS({ ...s, notifications: { ...s.notifications, newMember: v } })} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm">Avisar quando pagamento for conciliado</p>
            <Toggle checked={!!s.notifications?.paymentReceived} onChange={(v) => setS({ ...s, notifications: { ...s.notifications, paymentReceived: v } })} />
          </div>
          <button className="btn" disabled={saving === "notificacoes"} onClick={() => save({ notifications: s.notifications }, "notificacoes")}>
            {saving === "notificacoes" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== INTEGRAÇÕES ========== */}
      {tab === "integracoes" && (
        <section className="card space-y-3">
          <input className="input" placeholder="URL da API" value={s.integrations?.apiUrl ?? ""} onChange={(e) => setS({ ...s, integrations: { ...s.integrations, apiUrl: e.target.value } })} />
          <input className="input" placeholder="URL de Webhooks" value={s.integrations?.webhooksUrl ?? ""} onChange={(e) => setS({ ...s, integrations: { ...s.integrations, webhooksUrl: e.target.value } })} />
          <input className="input" placeholder="Token WhatsApp (Zap)" value={s.integrations?.zapToken ?? ""} onChange={(e) => setS({ ...s, integrations: { ...s.integrations, zapToken: e.target.value } })} />
          <input className="input" placeholder="SMTP From (opcional)" value={s.integrations?.smtpFrom ?? ""} onChange={(e) => setS({ ...s, integrations: { ...s.integrations, smtpFrom: e.target.value } })} />
          <button className="btn" disabled={saving === "integracoes"} onClick={() => save({ integrations: s.integrations }, "integracoes")}>
            {saving === "integracoes" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== FINANCEIRO ========== */}
      {tab === "financeiro" && (
        <section className="card space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select className="input" value={s.finance?.provider ?? "none"} onChange={(e) => setS({ ...s, finance: { ...s.finance, provider: e.target.value as any } })}>
              <option value="none">Sem provedor</option>
              <option value="gerencianet">Gerencianet</option>
              <option value="asaas">Asaas</option>
            </select>
            <input className="input" type="number" min={1} max={28} placeholder="Dia padrão" value={s.finance?.dueDay ?? 10} onChange={(e) => setS({ ...s, finance: { ...s.finance, dueDay: Number(e.target.value) } })} />
            <input className="input" type="number" step="0.01" placeholder="Multa (%)" value={s.finance?.finePct ?? 2} onChange={(e) => setS({ ...s, finance: { ...s.finance, finePct: Number(e.target.value) } })} />
            <input className="input" type="number" step="0.01" placeholder="Juros ao mês (%)" value={s.finance?.interestPct ?? 1} onChange={(e) => setS({ ...s, finance: { ...s.finance, interestPct: Number(e.target.value) } })} />
          </div>
          <button className="btn" disabled={saving === "financeiro"} onClick={() => save({ finance: s.finance }, "financeiro")}>
            {saving === "financeiro" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== EXPORTAÇÃO ========== */}
      {tab === "exportacao" && (
        <section className="card space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select className="input" value={s.exportCfg?.csvDelimiter ?? ";"} onChange={(e) => setS({ ...s, exportCfg: { ...(s.exportCfg || {}), csvDelimiter: e.target.value as any } })}>
              <option value=";">Separador ;</option>
              <option value=",">Separador ,</option>
            </select>
            <select className="input" value={s.exportCfg?.dateFormat ?? "pt-BR"} onChange={(e) => setS({ ...s, exportCfg: { ...(s.exportCfg || {}), dateFormat: e.target.value as any } })}>
              <option value="pt-BR">Data brasileira (dd/mm/aaaa)</option>
              <option value="iso">ISO (aaaa-mm-dd)</option>
            </select>
          </div>
          <button className="btn" disabled={saving === "exportacao"} onClick={() => save({ exportCfg: s.exportCfg }, "exportacao")}>
            {saving === "exportacao" ? "Salvando..." : "Salvar"}
          </button>
        </section>
      )}

      {/* ========== USUÁRIOS ========== */}
      {tab === "usuarios" && <UsersTab />}
    </PageLayout>
  );
}

/** ===== Aba de Usuários ===== */
function UsersTab() {
  type Dir = "asc" | "desc";
  type User = { id: string | number; nome: string; email: string; role?: string; ativo?: boolean; criadoEm?: string };

  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("u_q") ?? "";
  const page = Math.max(1, Number(sp.get("u_page") ?? 1) || 1);
  const limit = Math.max(1, Number(sp.get("u_limit") ?? 10) || 10);
  const sort = (sp.get("u_sort") as "nome" | "email" | "role" | "criadoEm") || "nome";
  const dir: Dir = (sp.get("u_dir") as Dir) === "desc" ? "desc" : "asc";

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
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch(apiUrl);
        const text = await res.text();
        let body: any;
        try { body = JSON.parse(text); } catch { body = { raw: text }; }
        const list: User[] = (Array.isArray(body) && body) || body?.data || body?.items || [];
        const metaTotal = body?.total ?? body?.count ?? body?.meta?.total ?? body?.pagination?.total ?? undefined;
        const metaPage  = body?.page ?? body?.meta?.page ?? body?.pagination?.page ?? page;
        const metaLimit = body?.limit ?? body?.per_page ?? body?.meta?.per_page ?? body?.pagination?.per_page ?? limit;
        const metaHasMore = body?.hasMore ?? body?.meta?.hasMore ?? (metaTotal != null ? metaPage * metaLimit < metaTotal : list.length === metaLimit);

        let final = list;
        if (metaTotal == null) {
          final = [...list].sort((a, b) => {
            const get = (u: User) => sort === "criadoEm" ? (u.criadoEm ? Date.parse(u.criadoEm) : 0) : (u as any)[sort] ?? "";
            const va = get(a), vb = get(b);
            const r = typeof va === "number" && typeof vb === "number"
              ? va - vb
              : String(va).localeCompare(String(vb), "pt-BR", { sensitivity: "base" });
            return dir === "asc" ? r : -r;
          });
          const start = (page - 1) * limit;
          final = final.slice(start, start + limit);
        }

        if (!alive) return;
        setData(final);
        setTotal(metaTotal ?? list.length);
        setHasMore(metaHasMore);
      } catch (e: any) {
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
    usp.set("tab", "usuarios");
    Object.entries(next).forEach(([k, v]) => {
      const key = `u_${k}`;
      if (v === undefined || v === "") usp.delete(key);
      else usp.set(key, String(v));
    });
    router.push(`/dashboard/configuracoes?${usp.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({ q: query.trim() || undefined, page: 1 });
  }
  function onHeader(field: "nome" | "email" | "role" | "criadoEm") {
    const nextDir: Dir = sort === field && dir === "asc" ? "desc" : "asc";
    pushQuery({ sort: field, dir: nextDir, page: 1 });
  }
  const th = (label: string, field: "nome" | "email" | "role" | "criadoEm") => (
    <th className="px-3 py-2 text-left font-medium cursor-pointer select-none border-b border-[var(--border)] muted" onClick={() => onHeader(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === field && <span className="text-xs">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );
  const showingFrom = (page - 1) * limit + (data.length ? 1 : 0);
  const showingTo = (page - 1) * limit + data.length;
  const pageCount = total ? Math.max(1, Math.ceil(total / limit)) : undefined;
  const fmtDate = (d?: string) => (!d ? "-" : new Date(d).toLocaleDateString());

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">Usuários</h2>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <form onSubmit={submitSearch} className="flex-1 sm:w-72">
            <input className="input w-full" placeholder="Buscar por nome ou e-mail…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>
          <select className="input px-2 py-2" value={limit} onChange={(e) => pushQuery({ limit: Number(e.target.value), page: 1 })}>
            {[10, 25, 50].map((n) => (<option key={n} value={n}>{n}/página</option>))}
          </select>
          <a href="/dashboard/configuracoes/usuarios/novo" className="btn">Novo Usuário</a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {loading ? (
          <div className="p-6 text-sm muted">Carregando…</div>
        ) : err ? (
          <div className="p-6 text-sm text-rose-500">Erro: {err}</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-sm muted">Nenhum usuário encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[color-mix(in_oklch,var(--surface),black_4%)]">
              <tr>
                {th("Nome", "nome")}
                {th("E-mail", "email")}
                {th("Papel", "role")}
                {th("Criado em", "criadoEm")}
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[color-mix(in_oklch,var(--surface),black_4%)]">
                  <td className="px-3 py-2"><a className="hover:underline" href={`/dashboard/configuracoes/usuarios/${u.id}`}>{u.nome}</a></td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2"><span className="chip">{u.role ?? "-"}</span></td>
                  <td className="px-3 py-2 muted">{fmtDate(u.criadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs muted">
          {total != null ? <>Mostrando <b>{showingFrom || 0}</b>–<b>{showingTo}</b> de <b>{total}</b></> : <>Página <b>{page}</b>{pageCount ? <> de <b>{pageCount}</b></> : null}</>}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn text-sm disabled:opacity-50" onClick={() => pushQuery({ page: page - 1 })} disabled={page <= 1}>Anterior</button>
          <button className="btn text-sm disabled:opacity-50" onClick={() => pushQuery({ page: page + 1 })} disabled={hasMore === false || (total != null && pageCount != null && page >= pageCount)}>Próxima</button>
        </div>
      </div>
    </section>
  );
}

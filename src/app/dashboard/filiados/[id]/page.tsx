"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Filiado = {
  id: string | number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  sindicato?: string;
  status?: "Ativo" | "Pendente" | "Inativo" | string;
  desde?: string; // ISO
  endereco?: { logradouro?: string; numero?: string; bairro?: string; cidade?: string; uf?: string; cep?: string };
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

type Contrib = {
  id: string | number;
  competencia?: string; // AAAA-MM
  valor?: number;
  status?: "Paga" | "Em aberto" | "Atrasada" | string;
  criadoEm?: string;
};

const money = (v: number | undefined) =>
  v == null ? "-" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FiliadoEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const sp = useSearchParams();

  // aba via querystring (?tab=dados|contribuicoes|historico)
  const tab = (sp.get("tab") as "dados" | "contribuicoes" | "historico") || "dados";
  function setTab(t: "dados" | "contribuicoes" | "historico") {
    const usp = new URLSearchParams(sp.toString());
    usp.set("tab", t);
    router.push(`/dashboard/filiados/${id}?${usp.toString()}`);
  }

  const [f, setF] = useState<Filiado | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Contribuições
  const [contribs, setContribs] = useState<Contrib[]>([]);
  const [cLoading, setCLoading] = useState(false);
  const [cErr, setCErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiFetch(`/api/filiados/${id}`);
        const text = await res.text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text };
        }
        const fi: Filiado = body?.data ?? body ?? null;
        if (!alive) return;
        setF(fi);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message ?? "Falha ao carregar filiado.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (tab !== "contribuicoes") return; // carrega on-demand
    let alive = true;
    (async () => {
      try {
        setCLoading(true);
        setCErr(null);
        const res = await apiFetch(`/api/contribuicoes?filiadoId=${id}&limit=25`);
        const txt = await res.text();
        let body: any;
        try {
          body = JSON.parse(txt);
        } catch {
          body = { raw: txt };
        }
        const list: Contrib[] = (Array.isArray(body) && body) || body?.data || body?.items || [];
        if (!alive) return;
        setContribs(list);
      } catch (e: any) {
        if (!alive) return;
        setCErr(e.message ?? "Falha ao carregar contribuições.");
      } finally {
        if (!alive) return;
        setCLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, tab]);

  async function patch(payload: Partial<Filiado>) {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/filiados/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      let body: any;
      try {
        body = JSON.parse(txt);
      } catch {
        body = { raw: txt };
      }
      if (!res.ok) throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      setMsg("Alterações salvas.");
      setF((cur) => (cur ? ({ ...cur, ...payload } as Filiado) : cur));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeF() {
    if (!confirm("Excluir este filiado permanentemente?")) return;
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/filiados/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        let b: any;
        try {
          b = JSON.parse(t);
        } catch {
          b = { raw: t };
        }
        throw new Error(b?.error || b?.message || b?.raw || `HTTP ${res.status}`);
      }
      router.push("/dashboard/filiados");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="card p-6 text-sm muted">Carregando…</div>
      </PageLayout>
    );
  }
  if (!f) {
    return (
      <PageLayout>
        <div className="card p-6">Filiado não encontrado.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={f.nome || "Filiado"}
        subtitle={f.cpf ? `CPF: ${f.cpf}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            <Link className="btn" href="/dashboard/filiados">
              Voltar
            </Link>
            <button className="btn" onClick={() => patch({})} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button className="btn" onClick={removeF} disabled={saving}>
              Excluir
            </button>
          </div>
        }
      />

      {msg && (
        <div className="card p-3 text-sm border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
          {msg}
        </div>
      )}
      {err && (
        <div className="card p-3 text-sm border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300">
          {err}
        </div>
      )}

      {/* Abas */}
      <div className="mb-3 flex gap-2 border-b border-[var(--border)]">
        {(["dados", "contribuicoes", "historico"] as const).map((key) => {
          const label = key === "dados" ? "Dados" : key === "contribuicoes" ? "Contribuições" : "Histórico";
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm rounded-t-lg border-b-2 ${
                active ? "border-[var(--brand)]" : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ====== ABA DADOS ====== */}
      {tab === "dados" && (
        <div className="grid gap-4 md:grid-cols-3">
          <section className="card md:col-span-2 space-y-3">
            <h3 className="font-medium">Informações básicas</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs muted">Nome</label>
                <input
                  className="input mt-1"
                  value={f.nome}
                  onChange={(e) => setF({ ...f, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-xs muted">CPF</label>
                <input
                  className="input mt-1"
                  value={f.cpf || ""}
                  onChange={(e) => setF({ ...f, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="text-xs muted">E-mail</label>
                <input
                  className="input mt-1"
                  value={f.email || ""}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-xs muted">Telefone</label>
                <input
                  className="input mt-1"
                  value={f.telefone || ""}
                  onChange={(e) => setF({ ...f, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-xs muted">Sindicato</label>
                <input
                  className="input mt-1"
                  value={f.sindicato || ""}
                  onChange={(e) => setF({ ...f, sindicato: e.target.value })}
                  placeholder="Nome do sindicato"
                />
              </div>
              <div>
                <label className="text-xs muted">Status</label>
                <select
                  className="input mt-1"
                  value={f.status || "Ativo"}
                  onChange={(e) => setF({ ...f, status: e.target.value })}
                >
                  <option>Ativo</option>
                  <option>Pendente</option>
                  <option>Inativo</option>
                </select>
              </div>
              <div>
                <label className="text-xs muted">Desde</label>
                <input
                  className="input mt-1"
                  type="date"
                  value={f.desde ? new Date(f.desde).toISOString().substring(0, 10) : ""}
                  onChange={(e) =>
                    setF({ ...f, desde: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs muted">Observações</label>
              <textarea
                className="input mt-1 h-28"
                value={f.observacoes || ""}
                onChange={(e) => setF({ ...f, observacoes: e.target.value })}
                placeholder="Anotações internas"
              />
            </div>

            <div>
              <h4 className="font-medium">Endereço</h4>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <input
                  className="input"
                  placeholder="Logradouro"
                  value={f.endereco?.logradouro || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), logradouro: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Número"
                  value={f.endereco?.numero || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), numero: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Bairro"
                  value={f.endereco?.bairro || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), bairro: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Cidade"
                  value={f.endereco?.cidade || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), cidade: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="UF"
                  value={f.endereco?.uf || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), uf: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="CEP"
                  value={f.endereco?.cep || ""}
                  onChange={(e) => setF({ ...f, endereco: { ...(f.endereco || {}), cep: e.target.value } })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn" onClick={() => patch(f)} disabled={saving}>
                {saving ? "Salvando…" : "Salvar alterações"}
              </button>
              <button
                className="btn"
                onClick={() => router.push(`/dashboard/contribuicoes/nova?filiadoId=${f.id}`)}
              >
                Lançar contribuição
              </button>
            </div>
          </section>

          <section className="card space-y-3">
            <h3 className="font-medium">Resumo</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="chip">{f.status || "-"}</span>
              {f.desde && <span className="chip">Desde {new Date(f.desde).toLocaleDateString()}</span>}
              {f.sindicato && <span className="chip">{f.sindicato}</span>}
            </div>
            <p className="text-sm">
              <span className="muted">Criado em:</span> {f.criadoEm ? new Date(f.criadoEm).toLocaleString() : "-"}
            </p>
            <p className="text-sm">
              <span className="muted">Atualizado em:</span>{" "}
              {f.atualizadoEm ? new Date(f.atualizadoEm).toLocaleString() : "-"}
            </p>
          </section>
        </div>
      )}

      {/* ====== ABA CONTRIBUIÇÕES ====== */}
      {tab === "contribuicoes" && (
        <section className="card p-0 overflow-x-auto">
          {cLoading ? (
            <div className="p-6 text-sm muted">Carregando…</div>
          ) : cErr ? (
            <div className="p-6 text-sm text-[var(--danger)]">Erro: {cErr}</div>
          ) : contribs.length === 0 ? (
            <div className="p-6 text-sm muted">Nenhuma contribuição encontrada.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-3)]">
                <tr>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)] text-[var(--muted)]">
                    Competência
                  </th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)] text-[var(--muted)]">
                    Valor
                  </th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)] text-[var(--muted)]">
                    Status
                  </th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)] text-[var(--muted)]">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {contribs.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface-3)] border-b border-[var(--border)]">
                    <td className="py-2.5 px-2">{c.competencia ?? "-"}</td>
                    <td className="py-2.5 px-2">{money(c.valor)}</td>
                    <td className="py-2.5 px-2">
                      <span className="chip">{c.status ?? "-"}</span>
                    </td>
                    <td className="py-2.5 px-2">{c.criadoEm ? new Date(c.criadoEm).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ====== ABA HISTÓRICO ====== */}
      {tab === "historico" && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card">
            <h3 className="font-medium mb-2">Eventos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="muted">Cadastro</span>
                <span>{f.criadoEm ? new Date(f.criadoEm).toLocaleString() : "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">Última atualização</span>
                <span>{f.atualizadoEm ? new Date(f.atualizadoEm).toLocaleString() : "-"}</span>
              </li>
              {/* Adapte com eventos do seu backend */}
            </ul>
          </section>
          <section className="card">
            <h3 className="font-medium mb-2">Anotações</h3>
            <textarea
              className="input h-44"
              value={f.observacoes || ""}
              onChange={(e) => setF({ ...f, observacoes: e.target.value })}
              placeholder="Linha do tempo, ocorrências, etc."
            />
            <div className="mt-2">
              <button className="btn" onClick={() => patch({ observacoes: f.observacoes })} disabled={saving}>
                {saving ? "Salvando…" : "Salvar anotações"}
              </button>
            </div>
          </section>
        </div>
      )}
    </PageLayout>
  );
}

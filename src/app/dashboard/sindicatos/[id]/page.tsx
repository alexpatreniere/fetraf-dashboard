"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Endereco = {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  municipio?: string;
  uf?: string;
  complemento?: string;
};

type FiliadoLite = {
  id: string | number;
  nome: string;
  cpf?: string;
  status?: string;
  desde?: string;
};

type HistEvt = {
  id?: string | number;
  tipo?: string;
  descricao?: string;
  data?: string;
  por?: string;
};

type Sindicato = {
  id: string | number;
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  status?: "Ativo" | "Inativo" | "Pendente" | string;
  endereco?: Endereco | null;
  criadoEm?: string;
  atualizadoEm?: string;
  // opcionais
  filiados?: FiliadoLite[];
  history?: HistEvt[];
};

type Tab = "resumo" | "filiados" | "historico";

function fmtDate(d?: string) {
  return d ? new Date(d).toLocaleString("pt-BR") : "-";
}

export default function SindicatoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sp = useSearchParams();

  const id = params?.id;
  const tab = (sp.get("tab") as Tab) || "resumo";

  const [data, setData] = useState<Sindicato | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<Tab | null>(null);

  const apiUrl = useMemo(() => `/api/sindicatos/${encodeURIComponent(String(id))}`, [id]);

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

        const s = (body?.data ?? body ?? {}) as any;

        const obj: Sindicato = {
          id: s.id ?? id,
          nome: s.nome ?? "",
          cnpj: s.cnpj ?? "",
          email: s.email ?? "",
          telefone: s.telefone ?? "",
          status: s.status ?? "Ativo",
          endereco:
            s.endereco ??
            (s.address
              ? {
                  logradouro: s.address.logradouro ?? s.address.street ?? "",
                  numero: s.address.numero ?? s.address.number ?? "",
                  bairro: s.address.bairro ?? s.address.district ?? "",
                  cep: s.address.cep ?? s.address.zip ?? "",
                  cidade: s.address.cidade ?? s.address.city ?? "",
                  municipio: s.address.municipio ?? s.address.county ?? "",
                  uf: s.address.uf ?? s.address.state ?? "",
                  complemento: s.address.complemento ?? s.address.complement ?? "",
                }
              : null),
          criadoEm: s.criadoEm ?? s.created_at ?? undefined,
          atualizadoEm: s.atualizadoEm ?? s.updated_at ?? undefined,
          filiados: Array.isArray(s.filiados) ? s.filiados : Array.isArray(body?.filiados) ? body.filiados : [],
          history: Array.isArray(s.history) ? s.history : Array.isArray(body?.history) ? body.history : [],
        };

        if (!alive) return;
        setData(obj);
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
  }, [apiUrl, id]);

  function go(next: Tab) {
    const usp = new URLSearchParams(sp.toString());
    usp.set("tab", next);
    router.push(`/dashboard/sindicatos/${id}?${usp.toString()}`);
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

  async function ativar() {
    await patch({ status: "Ativo" }, "resumo");
    setData((v) => (v ? { ...v, status: "Ativo" } : v));
  }
  async function desativar() {
    await patch({ status: "Inativo" }, "resumo");
    setData((v) => (v ? { ...v, status: "Inativo" } : v));
  }

  return (
    <PageLayout>
      <PageHeader
        title={loading ? "Carregando…" : `Sindicato #${data ? data.id : ""}`}
        subtitle="Dados cadastrais e histórico"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.push("/dashboard/sindicatos")}>
              Voltar
            </button>
            <a className="btn" href={`/dashboard/sindicatos/${id}/editar`}>
              Editar
            </a>
            {data?.status === "Ativo" ? (
              <button className="btn border-danger text-danger" disabled={Boolean(saving)} onClick={desativar}>
                Desativar
              </button>
            ) : (
              <button className="btn-brand" disabled={Boolean(saving)} onClick={ativar}>
                Ativar
              </button>
            )}
          </div>
        }
      />

      <div className="flex gap-2 mb-3">
        <button className={`tab ${tab === "resumo" ? "tab-active" : ""}`} onClick={() => go("resumo")}>
          Resumo
        </button>
        <button className={`tab ${tab === "filiados" ? "tab-active" : ""}`} onClick={() => go("filiados")}>
          Filiados
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
          <div className="card space-y-4 lg:col-span-2">
            <h2 className="text-base font-semibold">Informações</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm muted">Nome</p>
                <p className="text-sm">{data?.nome ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm muted">CNPJ</p>
                <p className="text-sm">{data?.cnpj ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm muted">E-mail</p>
                <p className="text-sm">{data?.email ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm muted">Telefone</p>
                <p className="text-sm">{data?.telefone ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm muted">Status</p>
                <p className="text-sm">
                  <span
                    className={
                      "chip " +
                      (data?.status === "Ativo"
                        ? "border-emerald-300"
                        : data?.status === "Pendente"
                        ? "border-amber-300"
                        : data?.status === "Inativo"
                        ? "border-rose-300"
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

            <div className="pt-2">
              <h3 className="text-sm font-semibold mb-2">Endereço</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <p className="text-sm muted">Logradouro</p>
                  <p className="text-sm">{data?.endereco?.logradouro ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">Número</p>
                  <p className="text-sm">{data?.endereco?.numero ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">Bairro</p>
                  <p className="text-sm">{data?.endereco?.bairro ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">CEP</p>
                  <p className="text-sm">{data?.endereco?.cep ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">Complemento</p>
                  <p className="text-sm">{data?.endereco?.complemento ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">Cidade</p>
                  <p className="text-sm">{data?.endereco?.cidade ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">Município</p>
                  <p className="text-sm">{data?.endereco?.municipio ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm muted">UF</p>
                  <p className="text-sm">{data?.endereco?.uf ?? "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="text-base font-semibold">Ações rápidas</h2>
            <div className="flex flex-col gap-2">
              <a className="btn" href={`/dashboard/sindicatos/${id}/editar`}>
                Editar dados
              </a>
              {data?.status === "Ativo" ? (
                <button className="btn border-danger text-danger" onClick={desativar} disabled={Boolean(saving)}>
                  Desativar sindicato
                </button>
              ) : (
                <button className="btn-brand" onClick={ativar} disabled={Boolean(saving)}>
                  Ativar sindicato
                </button>
              )}
            </div>
          </div>
        </section>
      ) : tab === "filiados" ? (
        <section className="card p-0 overflow-x-auto">
          {!data?.filiados || data.filiados.length === 0 ? (
            <div className="p-6 text-sm muted">Nenhum filiado encontrado para este sindicato.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Nome</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">CPF</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Status</th>
                  <th className="py-2.5 px-2 text-left font-medium border-b border-[var(--border)]">Desde</th>
                </tr>
              </thead>
              <tbody>
                {data.filiados.map((f) => (
                  <tr key={String(f.id)} className="border-b border-[var(--border)]">
                    <td className="py-2.5 px-2">
                      <a className="hover:underline" href={`/dashboard/filiados/${f.id}`}>
                        {f.nome}
                      </a>
                    </td>
                    <td className="py-2.5 px-2">{f.cpf ?? "-"}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={
                          "chip " +
                          (f.status === "Ativo"
                            ? "border-emerald-300"
                            : f.status === "Pendente"
                            ? "border-amber-300"
                            : f.status === "Inativo"
                            ? "border-rose-300"
                            : "")
                        }
                      >
                        {f.status ?? "-"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 muted">{fmtDate(f.desde)}</td>
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
                    <td className="py-2.5 px-2">{fmtDate(h.data)}</td>
                    <td className="py-2.5 px-2">{h.tipo ?? "-"}</td>
                    <td className="py-2.5 px-2">{h.descricao ?? "-"}</td>
                    <td className="py-2.5 px-2">{h.por ?? "-"}</td>
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

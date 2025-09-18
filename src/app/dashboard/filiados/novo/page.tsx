"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type FiliadoInput = {
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  sindicato?: string;
  status?: "Ativo" | "Pendente" | "Inativo" | string;
  desde?: string; // yyyy-mm-dd
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  observacoes?: string;
};

export default function NovoFiliadoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [f, setF] = useState<FiliadoInput>({
    nome: "",
    status: "Ativo",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!f.nome.trim()) {
      setErr("Informe o nome do filiado.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...f,
        desde: f.desde ? new Date(f.desde).toISOString() : undefined,
      };
      const res = await fetch("/api/filiados", {
        method: "POST",
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

      // tenta pegar id retornado em body.data.id / body.id
      const id =
        body?.data?.id ?? body?.id ?? body?.data?.[0]?.id ?? null;

      setMsg("Filiado criado com sucesso.");
      router.push(id ? `/dashboard/filiados/${id}` : "/dashboard/filiados");
    } catch (e: any) {
      setErr(e.message ?? "Falha ao criar filiado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout>
      <PageHeader
        title="Novo Filiado"
        subtitle="Preencha os dados abaixo para cadastrar"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.push("/dashboard/filiados")}>
              Cancelar
            </button>
            <button className="btn btn-brand" form="form-filiado" type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
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

      <form id="form-filiado" className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
        {/* Dados principais */}
        <section className="card md:col-span-2 space-y-3">
          <h3 className="font-medium">Informações básicas</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs muted">Nome*</label>
              <input
                className="input mt-1"
                value={f.nome}
                onChange={(e) => setF({ ...f, nome: e.target.value })}
                placeholder="Nome completo"
                required
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
                type="email"
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
                value={f.desde || ""}
                onChange={(e) => setF({ ...f, desde: e.target.value })}
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
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), logradouro: e.target.value } })
                }
              />
              <input
                className="input"
                placeholder="Número"
                value={f.endereco?.numero || ""}
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), numero: e.target.value } })
                }
              />
              <input
                className="input"
                placeholder="Bairro"
                value={f.endereco?.bairro || ""}
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), bairro: e.target.value } })
                }
              />
              <input
                className="input"
                placeholder="Cidade"
                value={f.endereco?.cidade || ""}
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), cidade: e.target.value } })
                }
              />
              <input
                className="input"
                placeholder="UF"
                value={f.endereco?.uf || ""}
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), uf: e.target.value } })
                }
              />
              <input
                className="input"
                placeholder="CEP"
                value={f.endereco?.cep || ""}
                onChange={(e) =>
                  setF({ ...f, endereco: { ...(f.endereco || {}), cep: e.target.value } })
                }
              />
            </div>
          </div>
        </section>

        {/* Resumo/Ações */}
        <section className="card space-y-3">
          <h3 className="font-medium">Ações</h3>
          <p className="muted text-sm">
            Revise os dados antes de salvar. Você poderá editar depois.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={() => router.push("/dashboard/filiados")}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-brand" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </section>
      </form>
    </PageLayout>
  );
}

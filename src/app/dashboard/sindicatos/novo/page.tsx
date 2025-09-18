"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type Endereco = {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  complemento?: string;
};

export default function NovoSindicatoPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo");

  const [endereco, setEndereco] = useState<Endereco>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!nome.trim()) {
      setErr("Informe o nome do sindicato.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        cnpj: cnpj.trim() || undefined,
        municipio: municipio.trim() || endereco.cidade || undefined,
        uf: (uf || endereco.uf || "").toUpperCase() || undefined,
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        status,
        endereco,
      };

      const res = await fetch("/api/sindicatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let body: any;
      try { body = JSON.parse(raw); } catch { body = { raw }; }

      if (!res.ok) {
        throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      }

      const id =
        body?.id ??
        body?.data?.id ??
        body?.sindicato?.id ??
        body?.result?.id;

      setMsg("Sindicato criado com sucesso.");
      if (id != null) {
        router.replace(`/dashboard/sindicatos/${id}`);
      } else {
        router.replace("/dashboard/sindicatos");
      }
    } catch (e: any) {
      setErr(e.message ?? "Falha ao criar sindicato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <PageHeader
        title="Novo Sindicato"
        subtitle="Cadastro inicial"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.push("/dashboard/sindicatos")}>
              Cancelar
            </button>
            <button form="form-novo-sindicato" className="btn-brand" disabled={loading}>
              {loading ? "Salvando…" : "Salvar"}
            </button>
          </div>
        }
      />

      {err && <div className="card border-danger text-danger mb-3">{err}</div>}
      {msg && <div className="card border-[color-mix(in_oklch,var(--brand),black_14%)] mb-3">{msg}</div>}

      <form id="form-novo-sindicato" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold">Informações principais</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm muted">Nome *</label>
              <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="text-sm muted">CNPJ</label>
              <input className="input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
            </div>
            <div>
              <label className="text-sm muted">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="text-sm muted">Município</label>
              <input className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
            </div>
            <div>
              <label className="text-sm muted">UF</label>
              <input className="input max-w-24" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-sm muted">E-mail</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm muted">Telefone</label>
              <input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card space-y-3">
          <h2 className="text-base font-semibold">Endereço</h2>

          <div>
            <label className="text-sm muted">Logradouro</label>
            <input
              className="input"
              value={endereco.logradouro ?? ""}
              onChange={(e) => setEndereco((v) => ({ ...(v || {}), logradouro: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm muted">Número</label>
              <input
                className="input"
                value={endereco.numero ?? ""}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), numero: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm muted">Bairro</label>
              <input
                className="input"
                value={endereco.bairro ?? ""}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), bairro: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm muted">Cidade</label>
              <input
                className="input"
                value={endereco.cidade ?? ""}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), cidade: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm muted">UF</label>
              <input
                className="input max-w-24"
                value={(endereco.uf ?? "").toUpperCase()}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), uf: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm muted">CEP</label>
              <input
                className="input"
                value={endereco.cep ?? ""}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), cep: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm muted">Complemento</label>
              <input
                className="input"
                value={endereco.complemento ?? ""}
                onChange={(e) => setEndereco((v) => ({ ...(v || {}), complemento: e.target.value }))}
              />
            </div>
          </div>
        </section>
      </form>
    </PageLayout>
  );
}

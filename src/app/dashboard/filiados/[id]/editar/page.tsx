"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Form = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  sindicato: string;
  status: string;
  desde: string;
  endereco: string;
  nascimento: string;
};

export default function EditFiliadoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/filiados/${id}`);
        const body = await res.json().catch(async () => ({ raw: await res.text() }));
        const f = body.data ?? body;
        const initial: Form = {
          nome: f.nome ?? "",
          cpf: f.cpf ?? "",
          email: f.email ?? "",
          telefone: f.telefone ?? "",
          sindicato: f.sindicato ?? "",
          status: f.status ?? "Ativo",
          desde: f.desde ?? "",
          endereco: f.endereco ?? "",
          nascimento: f.nascimento ?? "",
        };
        setForm(initial);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/filiados/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);
      setOk("Alterações salvas.");
      router.push(`/dashboard/filiados/${id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (!form) return <div className="p-4">Filiado não encontrado.</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">Editar Filiado #{id}</h1>

      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" placeholder="Nome"
                 value={form.nome} onChange={(e)=>setForm(f=>({...f!, nome:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="CPF"
                 value={form.cpf} onChange={(e)=>setForm(f=>({...f!, cpf:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="E-mail"
                 value={form.email} onChange={(e)=>setForm(f=>({...f!, email:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="Telefone"
                 value={form.telefone} onChange={(e)=>setForm(f=>({...f!, telefone:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="Sindicato"
                 value={form.sindicato} onChange={(e)=>setForm(f=>({...f!, sindicato:e.target.value}))} />
          <select className="rounded-xl border px-3 py-2"
                  value={form.status} onChange={(e)=>setForm(f=>({...f!, status:e.target.value}))}>
            <option>Ativo</option>
            <option>Pendente</option>
            <option>Inativo</option>
          </select>
          <input className="rounded-xl border px-3 py-2" placeholder="Desde (YYYY-MM-DD)"
                 value={form.desde} onChange={(e)=>setForm(f=>({...f!, desde:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="Nascimento (YYYY-MM-DD)"
                 value={form.nascimento} onChange={(e)=>setForm(f=>({...f!, nascimento:e.target.value}))} />
        </div>

        <input className="w-full rounded-xl border px-3 py-2" placeholder="Endereço"
               value={form.endereco} onChange={(e)=>setForm(f=>({...f!, endereco:e.target.value}))} />

        {err && <p className="text-sm text-rose-500">{err}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl border px-3 py-2 text-sm">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <a href={`/dashboard/filiados/${id}`} className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

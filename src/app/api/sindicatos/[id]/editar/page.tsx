"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Form = {
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
  endereco: string;
};

export default function EditSindicatoPage() {
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
        const res = await apiFetch(`/api/sindicatos/${id}`);
        const body = await res.json().catch(async () => ({ raw: await res.text() }));
        const s = body.data ?? body;
        const initial: Form = {
          nome: s.nome ?? "",
          cnpj: s.cnpj ?? "",
          cidade: s.cidade ?? "",
          uf: s.uf ?? "",
          email: s.email ?? "",
          telefone: s.telefone ?? "",
          endereco: s.endereco ?? "",
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
      const res = await fetch(`/api/sindicatos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);
      setOk("Alterações salvas.");
      router.push(`/dashboard/sindicatos/${id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (!form) return <div className="p-4">Sindicato não encontrado.</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">Editar Sindicato #{id}</h1>

      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" placeholder="Nome"
                 value={form.nome} onChange={(e)=>setForm(f=>({...f!, nome:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="CNPJ"
                 value={form.cnpj} onChange={(e)=>setForm(f=>({...f!, cnpj:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="Cidade"
                 value={form.cidade} onChange={(e)=>setForm(f=>({...f!, cidade:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="UF"
                 value={form.uf} onChange={(e)=>setForm(f=>({...f!, uf:e.target.value.toUpperCase().slice(0,2)}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="E-mail"
                 value={form.email} onChange={(e)=>setForm(f=>({...f!, email:e.target.value}))} />
          <input className="rounded-xl border px-3 py-2" placeholder="Telefone"
                 value={form.telefone} onChange={(e)=>setForm(f=>({...f!, telefone:e.target.value}))} />
        </div>

        <input className="w-full rounded-xl border px-3 py-2" placeholder="Endereço"
               value={form.endereco} onChange={(e)=>setForm(f=>({...f!, endereco:e.target.value}))} />

        {err && <p className="text-sm text-rose-500">{err}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl border px-3 py-2 text-sm">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <a href={`/dashboard/sindicatos/${id}`} className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

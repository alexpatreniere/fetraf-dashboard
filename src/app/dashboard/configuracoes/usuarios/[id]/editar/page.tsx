"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function EditUsuarioPage() {
  const { id } = useParams<{ id:string }>();
  const router = useRouter();
  const [form, setForm] = useState<{ nome:string; email:string; role:string; ativo:boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch(`/api/usuarios/${id}`);
        const b = await r.json().catch(async () => ({ raw: await r.text() }));
        const u = b.data ?? b;
        setForm({ nome: u.nome ?? "", email: u.email ?? "", role: u.role ?? "analista", ativo: !!u.ativo });
      } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setErr(null); setSaving(true);
    try {
      const r = await fetch(`/api/usuarios/${id}`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form)
      });
      const t = await r.text(); let d:any=null; try{ d=JSON.parse(t) }catch{ d={ raw:t } }
      if (!r.ok) throw new Error(d?.error || d?.message || d?.raw || `HTTP ${r.status}`);
      router.push(`/dashboard/configuracoes/usuarios/${id}`);
    } catch (e:any) { setErr(e.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (!form) return <div className="p-4">Usuário não encontrado.</div>;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-lg font-semibold">Editar Usuário #{id}</h1>
      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Nome"
               value={form.nome} onChange={e=>setForm(f=>({...f!, nome:e.target.value}))}/>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="E-mail"
               value={form.email} onChange={e=>setForm(f=>({...f!, email:e.target.value}))}/>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select className="rounded-xl border px-3 py-2" value={form.role}
                  onChange={e=>setForm(f=>({...f!, role:e.target.value}))}>
            <option value="admin">Admin</option>
            <option value="financeiro">Financeiro</option>
            <option value="analista">Analista</option>
          </select>
          <select className="rounded-xl border px-3 py-2" value={form.ativo ? "1":"0"}
                  onChange={e=>setForm(f=>({...f!, ativo: e.target.value==="1"}))}>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl border px-3 py-2 text-sm">{saving?"Salvando…":"Salvar"}</button>
          <a href={`/dashboard/configuracoes/usuarios/${id}`} className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

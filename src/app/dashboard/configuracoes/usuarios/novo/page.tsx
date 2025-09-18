"use client";

import { useState } from "react";

export default function NovoUsuarioPage() {
  const [form, setForm] = useState({ nome:"", email:"", role:"analista", ativo:true, senha:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const payload: any = { nome:form.nome, email:form.email, role:form.role, ativo:!!form.ativo };
      if (form.senha) payload.senha = form.senha;
      const res = await fetch("/api/usuarios", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
      const text = await res.text(); const data = (()=>{ try{return JSON.parse(text)}catch{return { raw:text }} })();
      if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);
      const id = data?.id ?? data?.data?.id;
      window.location.href = id ? `/dashboard/configuracoes/usuarios/${id}` : "/dashboard/configuracoes/usuarios";
    } catch (e:any) {
      setErr(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-lg font-semibold">Novo Usuário</h1>
      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Nome"
               value={form.nome} onChange={e=>setForm(f=>({...f, nome:e.target.value}))}/>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="E-mail"
               value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select className="rounded-xl border px-3 py-2" value={form.role}
                  onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
            <option value="admin">Admin</option>
            <option value="financeiro">Financeiro</option>
            <option value="analista">Analista</option>
          </select>
          <select className="rounded-xl border px-3 py-2" value={form.ativo ? "1":"0"}
                  onChange={e=>setForm(f=>({...f, ativo: e.target.value==="1"}))}>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>
        <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="Senha inicial (opcional)"
               value={form.senha} onChange={e=>setForm(f=>({...f, senha:e.target.value}))}/>
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <div className="flex gap-2">
          <button disabled={loading} className="rounded-xl border px-3 py-2 text-sm">{loading?"Salvando…":"Salvar"}</button>
          <a href="/dashboard/configuracoes/usuarios" className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

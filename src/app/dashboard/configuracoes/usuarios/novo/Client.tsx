"use client";

import { useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

export default function NovoUsuarioClient() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "analista",
    ativo: true,
    senha: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const txt = await res.text();
      let body: any;
      try {
        body = JSON.parse(txt);
      } catch {
        body = { raw: txt };
      }
      if (!res.ok) throw new Error(body?.error || body?.message || body?.raw || `HTTP ${res.status}`);
      setMsg("Usuário criado com sucesso.");
      // opcional: limpar form
      // setForm({ nome: "", email: "", role: "analista", ativo: true, senha: "" });
    } catch (e: any) {
      setErr(e.message || "Falha ao criar usuário.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout>
      <PageHeader
        title="Novo usuário"
        subtitle="Preencha os dados para criar um novo usuário"
        actions={
          <Link className="btn" href="/dashboard/configuracoes/usuarios">
            Voltar
          </Link>
        }
      />

      {msg && <div className="card p-3 text-sm border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">{msg}</div>}
      {err && <div className="card p-3 text-sm border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300">{err}</div>}

      <form className="card p-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div className="sm:col-span-2">
          <label className="text-xs muted">Nome</label>
          <input
            className="input mt-1"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome completo"
            required
          />
        </div>

        <div>
          <label className="text-xs muted">E-mail</label>
          <input
            className="input mt-1"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="text-xs muted">Perfil</label>
          <select
            className="input mt-1"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="analista">Analista</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div>
          <label className="text-xs muted">Senha</label>
          <input
            className="input mt-1"
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="ativo"
            type="checkbox"
            className="accent-[var(--brand)]"
            checked={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          />
          <label htmlFor="ativo" className="text-sm">Ativo</label>
        </div>

        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="btn-brand" disabled={saving}>
            {saving ? "Salvando…" : "Criar usuário"}
          </button>
          <Link href="/dashboard/configuracoes/usuarios" className="btn">
            Cancelar
          </Link>
        </div>
      </form>
    </PageLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

type User = {
  id: string | number;
  nome: string;
  email: string;
  role?: "admin" | "financeiro" | "analista" | string;
  ativo?: boolean;
  criadoEm?: string;
};

export default function UsuarioEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiFetch(`/api/usuarios/${id}`);
        const text = await res.text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          body = { raw: text };
        }
        const u: User = body?.data ?? body ?? null;
        if (!alive) return;
        setUser(u);
      } catch (e: any) {
        if (!alive) return;
        setErr(e.message ?? "Falha ao carregar usuário.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function patch(payload: Partial<User>) {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
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
      setUser((u) => (u ? ({ ...u, ...payload } as User) : u));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo() {
    if (!user) return;
    await patch({ ativo: !user.ativo });
  }

  async function removeUser() {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
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
      router.push("/dashboard/configuracoes?tab=usuarios");
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
  if (!user) {
    return (
      <PageLayout>
        <div className="card p-6">Usuário não encontrado.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={user.nome || "Usuário"}
        subtitle={user.email}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => router.back()}>Voltar</button>
            <button className="btn" onClick={toggleAtivo} disabled={saving}>
              {user.ativo ? "Desativar" : "Ativar"}
            </button>
            <button className="btn btn-brand" onClick={() => patch({})} disabled={saving}>
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

      <div className="grid gap-4 md:grid-cols-3">
        {/* Dados principais */}
        <section className="card md:col-span-2 space-y-3">
          <h3 className="font-medium">Dados</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs muted">Nome</label>
              <input
                className="input mt-1"
                value={user.nome}
                onChange={(e) => setUser({ ...user, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-xs muted">E-mail</label>
              <input
                className="input mt-1"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs muted">Papel</label>
              <select
                className="input mt-1"
                value={user.role || "analista"}
                onChange={(e) => setUser({ ...user, role: e.target.value as any })}
              >
                <option value="admin">Administrador</option>
                <option value="financeiro">Financeiro</option>
                <option value="analista">Analista</option>
              </select>
            </div>
            <div>
              <label className="text-xs muted">Status</label>
              <div className="mt-1">
                <span className={`chip ${user.ativo ? "" : "muted"}`}>{user.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => patch({ nome: user.nome, email: user.email, role: user.role })}
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
            <button
              className="btn"
              onClick={() => alert("Funcionalidade de reset de senha – implemente a chamada da sua API.")}
            >
              Resetar senha
            </button>
          </div>
        </section>

        {/* Metadados / Ações perigosas */}
        <section className="card space-y-3">
          <h3 className="font-medium">Metadados</h3>
          <p className="text-sm">
            <span className="muted">Criado em:</span>{" "}
            {user.criadoEm ? new Date(user.criadoEm).toLocaleString() : "-"}
          </p>

          <div className="pt-2">
            <h4 className="font-medium text-rose-600 dark:text-rose-400">Zona perigosa</h4>
            <p className="muted text-sm">Ações permanentes. Cuidado.</p>
            <div className="mt-2 flex gap-2">
              <button className="btn" onClick={toggleAtivo} disabled={saving}>
                {user.ativo ? "Desativar" : "Ativar"}
              </button>
              <button className="btn" onClick={removeUser} disabled={saving}>
                Excluir usuário
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

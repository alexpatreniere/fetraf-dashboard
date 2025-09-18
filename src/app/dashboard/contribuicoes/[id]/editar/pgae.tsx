"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Form = {
  competencia: string;
  status: "Aberta" | "Parcial" | "Fechada" | string;
  pagantes: string;
  valor: string;
};

export default function EditContribuicaoPage() {
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
        const res = await apiFetch(`/api/contribuicoes/${id}`);
        const body = await res.json().catch(async () => ({ raw: await res.text() }));
        const c = body.data ?? body;
        const initial: Form = {
          competencia: (c.competencia ?? "").slice(0, 7), // ajusta para YYYY-MM
          status: c.status ?? "Aberta",
          pagantes: c.pagantes != null ? String(c.pagantes) : "",
          valor: c.valor != null ? String(c.valor) : "",
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
      const payload: any = {
        competencia: form.competencia,
        status: form.status,
      };
      if (form.pagantes !== "") payload.pagantes = Number(form.pagantes);
      if (form.valor !== "") payload.valor = Number(form.valor.replace(",", "."));

      const res = await fetch(`/api/contribuicoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);
      setOk("Alterações salvas.");
      router.push(`/dashboard/contribuicoes/${id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (!form) return <div className="p-4">Contribuição não encontrada.</div>;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-lg font-semibold">Editar Contribuição #{id}</h1>

      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="month"
            className="rounded-xl border px-3 py-2"
            placeholder="Competência (YYYY-MM)"
            value={form.competencia}
            onChange={(e)=>setForm(f=>({...f!, competencia:e.target.value}))}
          />
          <select
            className="rounded-xl border px-3 py-2"
            value={form.status}
            onChange={(e)=>setForm(f=>({...f!, status:e.target.value}))}
          >
            <option>Aberta</option>
            <option>Parcial</option>
            <option>Fechada</option>
          </select>
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Pagantes"
            value={form.pagantes}
            onChange={(e)=>setForm(f=>({...f!, pagantes:e.target.value}))}
          />
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Valor total (ex: 1234.56)"
            value={form.valor}
            onChange={(e)=>setForm(f=>({...f!, valor:e.target.value}))}
          />
        </div>

        {err && <p className="text-sm text-rose-500">{err}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl border px-3 py-2 text-sm">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <a href={`/dashboard/contribuicoes/${id}`} className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

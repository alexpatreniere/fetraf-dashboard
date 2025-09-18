"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Form = {
  nome: string;
  tipo: string;
  periodoInicio: string;
  periodoFim: string;
  formatos?: string; // ex.: "csv,pdf"
  filtros: string;
};

export default function EditRelatorioPage() {
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
        const res = await apiFetch(`/api/relatorios/${id}`);
        const body = await res.json().catch(async () => ({ raw: await res.text() }));
        const r = body.data ?? body;
        const initial: Form = {
          nome: r.nome ?? r.tipo ?? "",
          tipo: r.tipo ?? "",
          periodoInicio: r.periodoInicio ?? "",
          periodoFim: r.periodoFim ?? "",
          formatos: Array.isArray(r.formatos) ? r.formatos.join(",") : "",
          filtros: typeof r.filtros === "string" ? r.filtros : (r.filtros ? JSON.stringify(r.filtros) : ""),
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
    setErr(null); setOk(null); setSaving(true);
    try {
      const payload: any = {
        nome: form.nome,
        tipo: form.tipo,
        periodoInicio: form.periodoInicio,
        periodoFim: form.periodoFim,
      };
      if (form.formatos) payload.formatos = form.formatos.split(",").map(s => s.trim()).filter(Boolean);
      if (form.filtros) {
        try { payload.filtros = JSON.parse(form.filtros); }
        catch { payload.filtros = form.filtros; }
      }

      const res = await fetch(`/api/relatorios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: any = null; try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);

      setOk("Alterações salvas.");
      router.push(`/dashboard/relatorios/${id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (!form) return <div className="p-4">Relatório não encontrado.</div>;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-lg font-semibold">Editar Relatório #{id}</h1>

      <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" placeholder="Nome"
                 value={form.nome} onChange={(e)=>setForm(f=>({...f!, nome:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2" placeholder="Tipo"
                 value={form.tipo} onChange={(e)=>setForm(f=>({...f!, tipo:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2" type="date" placeholder="Início"
                 value={form.periodoInicio} onChange={(e)=>setForm(f=>({...f!, periodoInicio:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2" type="date" placeholder="Fim"
                 value={form.periodoFim} onChange={(e)=>setForm(f=>({...f!, periodoFim:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2" placeholder="Formatos (csv,pdf)"
                 value={form.formatos ?? ""} onChange={(e)=>setForm(f=>({...f!, formatos:e.target.value}))}/>
          <input className="rounded-xl border px-3 py-2 sm:col-span-2" placeholder='Filtros (JSON ou texto)'
                 value={form.filtros} onChange={(e)=>setForm(f=>({...f!, filtros:e.target.value}))}/>
        </div>

        {err && <p className="text-sm text-rose-500">{err}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl border px-3 py-2 text-sm">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <a href={`/dashboard/relatorios/${id}`} className="rounded-xl border px-3 py-2 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  );
}

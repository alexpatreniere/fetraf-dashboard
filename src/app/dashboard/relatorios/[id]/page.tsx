"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Relatorio = {
  id: string | number;
  nome?: string;
  tipo?: string;
  status?: string;
  criadoEm?: string;
  periodoInicio?: string;
  periodoFim?: string;
  formatos?: string[];     // ex: ["csv","pdf"]
  fileUrl?: string;        // se o backend retornar diretamente
};

function labelNome(r: Relatorio) {
  return r.nome ?? r.tipo ?? `Relatório ${r.id}`;
}
function fmtDate(d?: string) {
  if (!d) return "-";
  const t = Date.parse(d);
  return Number.isNaN(t) ? d : new Date(t).toLocaleString();
}

export default function RelatorioDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/relatorios/${id}`);
        const body = await res.json().catch(async () => ({ raw: await res.text() }));
        setItem(body.data ?? body);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onDelete() {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/relatorios/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        let data: any = null; try { data = JSON.parse(text); } catch { data = { raw: text }; }
        throw new Error(data?.error || data?.message || data?.raw || `HTTP ${res.status}`);
      }
      router.push("/dashboard/relatorios");
    } catch (e: any) {
      alert(`Erro ao excluir: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  }

  function download(format: "csv" | "pdf") {
    // proxy do app que encaminha para o backend
    window.location.href = `/api/relatorios/${id}/download?format=${format}`;
  }

  if (loading) return <div className="p-4 text-sm text-neutral-500">Carregando…</div>;
  if (err) return <div className="p-4 text-sm text-rose-500">Erro: {err}</div>;
  if (!item) return <div className="p-4">Relatório não encontrado.</div>;

  const formatos = (item.formatos && item.formatos.length ? item.formatos : ["csv", "pdf"]) as ("csv" | "pdf")[];

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{labelNome(item)} #{item.id}</h1>
        <div className="flex gap-2">
          <a href={`/dashboard/relatorios/${id}/editar`} className="rounded-xl border px-3 py-2 text-sm">Editar</a>
          <button onClick={onDelete} disabled={deleting}
            className="rounded-xl border px-3 py-2 text-sm text-rose-600 border-rose-300 disabled:opacity-50">
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
          <button onClick={() => router.push("/dashboard/relatorios")} className="rounded-xl border px-3 py-2 text-sm">
            Voltar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><dt className="text-xs text-neutral-500">Status</dt><dd className="text-sm">{item.status ?? "-"}</dd></div>
          <div><dt className="text-xs text-neutral-500">Criado em</dt><dd className="text-sm">{fmtDate(item.criadoEm)}</dd></div>
          <div><dt className="text-xs text-neutral-500">Período</dt>
            <dd className="text-sm">
              {item.periodoInicio || item.periodoFim
                ? `${item.periodoInicio ?? "?"} — ${item.periodoFim ?? "?"}`
                : "-"}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-2">
          {formatos.includes("csv") && (
            <button onClick={() => download("csv")} className="rounded-xl border px-3 py-2 text-sm">Baixar CSV</button>
          )}
          {formatos.includes("pdf") && (
            <button onClick={() => download("pdf")} className="rounded-xl border px-3 py-2 text-sm">Baixar PDF</button>
          )}
          {item.fileUrl && (
            <a className="rounded-xl border px-3 py-2 text-sm" href={item.fileUrl} target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

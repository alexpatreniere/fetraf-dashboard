// src/app/dashboard/configuracoes/Client.tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";

type TabKey = "geral" | "notificacoes" | "usuarios" | "seguranca";

const TABS: { key: TabKey; label: string }[] = [
  { key: "geral", label: "Geral" },
  { key: "notificacoes", label: "Notificações" },
  { key: "usuarios", label: "Usuários" },
  { key: "seguranca", label: "Segurança" },
];

export default function ConfiguracoesClient() {
  const search = useSearchParams();
  const router = useRouter();

  const active: TabKey = useMemo(() => {
    const t = (search.get("tab") as TabKey) || "geral";
    return (TABS.find((x) => x.key === t)?.key ?? "geral") as TabKey;
  }, [search]);

  function goTab(key: TabKey) {
    const usp = new URLSearchParams(search.toString());
    usp.set("tab", key);
    router.push(`/dashboard/configuracoes?${usp.toString()}`);
  }

  return (
    <PageLayout>
      <PageHeader title="Configurações" subtitle="Preferências do sistema" />

      {/* Abas */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => goTab(t.key)}
            className={
              "chip px-3 py-1.5 " +
              (active === t.key
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="card p-6">
        {active === "geral" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Dados da Federação</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm muted">Nome</span>
                <input className="input mt-1" defaultValue="Federação dos Trabalhadores do Ramo Financeiro do RJ e ES" />
              </label>
              <label className="block">
                <span className="text-sm muted">Sigla</span>
                <input className="input mt-1" defaultValue="FETRAF RJ-ES" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm muted">Site</span>
                <input className="input mt-1" placeholder="https://www.fetraf.org.br" />
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-brand">Salvar</button>
              <button className="btn">Cancelar</button>
            </div>
          </div>
        )}

        {active === "notificacoes" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Notificações</h3>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[var(--brand)]" />
              Enviar e-mails de cobrança automaticamente
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-[var(--brand)]" />
              Avisar sobre pagamentos atrasados
            </label>
            <div className="flex gap-2">
              <button className="btn btn-brand">Salvar</button>
              <button className="btn">Cancelar</button>
            </div>
          </div>
        )}

        {active === "usuarios" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Controle de Usuários</h3>
            <p className="text-sm muted">
              Gerencie permissões e redefinição de senha dos usuários do painel.
            </p>
            <a href="/dashboard/usuarios" className="btn btn-brand">Abrir gestão de usuários</a>
          </div>
        )}

        {active === "seguranca" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Segurança</h3>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-[var(--brand)]" />
              Exigir 2FA no login
            </label>
            <label className="block">
              <span className="text-sm muted">Tempo de sessão (minutos)</span>
              <input type="number" className="input mt-1" defaultValue={60} />
            </label>
            <div className="flex gap-2">
              <button className="btn btn-brand">Salvar</button>
              <button className="btn">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

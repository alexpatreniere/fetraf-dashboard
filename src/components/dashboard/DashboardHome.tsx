"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Serie = { mes: string; filiados: number; contribuicoes: number };

const serie: Serie[] = [
  { mes: "Jan", filiados: 64, contribuicoes: 82 },
  { mes: "Fev", filiados: 142, contribuicoes: 96 },
  { mes: "Mar", filiados: 176, contribuicoes: 134 },
  { mes: "Abr", filiados: 88, contribuicoes: 102 },
  { mes: "Mai", filiados: 224, contribuicoes: 160 },
  { mes: "Jun", filiados: 120, contribuicoes: 115 },
];

export default function DashboardHome() {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-neutral-500">Total de Filiados</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">8.421</span>
            <span className="chip text-emerald-600 dark:text-emerald-400">+4.2%</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500">Contribuições (R$)</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">142.980</span>
            <span className="chip">-6.1%</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-neutral-500">Pendências</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">27</span>
            <span className="chip">-3</span>
          </div>
        </div>
      </div>

      {/* Gráfico + lista */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <p className="mb-2 text-sm font-medium">Crescimento de filiados e contribuições</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="filiados" radius={[8, 8, 0, 0]} />
                <Bar dataKey="contribuicoes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <p className="mb-2 text-sm font-medium">Filiados recentes</p>
          <div className="space-y-2 text-sm">
            {[
              { nome: "Maria Souza", sind: "FETRAF Sul", status: "Ativo", desde: "03/11/2023" },
              { nome: "João Lima", sind: "FETRAF Norte", status: "Pendente", desde: "17/02/2024" },
              { nome: "Ana Beatriz", sind: "FETRAF Centro-Oeste", status: "Ativo", desde: "28/06/2024" },
              { nome: "Carlos Pereira", sind: "FETRAF Sudeste", status: "Inativo", desde: "09/09/2022" },
            ].map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span className="col-span-2 truncate">{r.nome}</span>
                <span className="truncate text-neutral-500">{r.sind}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className="chip">{r.status}</span>
                  <span className="text-xs text-neutral-500">{r.desde}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atalhos + Últimas ações */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="card p-4">
          <p className="mb-3 text-sm font-medium">Atalhos</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn">Importar CSV</button>
            <button className="btn">Gerar Carteirinhas</button>
            <button className="btn">Emitir Boleto</button>
            <button className="btn">Exportar Relatório</button>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <p className="mb-3 text-sm font-medium">Últimas ações</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <span>
                Você adicionou <b>3 filiados</b> ao sindicato <b>FETRAF Sul</b>.
              </span>
              <span className="text-xs text-neutral-500">há 2h</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <span>
                Contribuições de <b>Julho</b> conciliadas.
              </span>
              <span className="text-xs text-neutral-500">ontem</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
              <span>
                Relatório <b>Financeiro Q2</b> exportado.
              </span>
              <span className="text-xs text-neutral-500">3 dias</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

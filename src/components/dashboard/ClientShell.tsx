"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Menu,
  Search,
  Users,
  Home,
  Landmark,
  FileText,
  Settings,
  LogOut,
  Bell,
  DollarSign,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type IconType = LucideIcon;

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: IconType;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <li>
      <Link
        href={href}
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
          "hover:bg-[var(--surface-2)]",
          active ? "bg-[var(--surface-2)] font-medium" : "text-[var(--muted)]",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [imgOk, setImgOk] = useState(true);

  // persistência do estado do sidebar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shell:sidebarOpen");
      if (saved !== null) setSidebarOpen(saved === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("shell:sidebarOpen", sidebarOpen ? "1" : "0");
    } catch {}
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--fg)]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-4 p-4">
        {/* Sidebar */}
        <aside
          className={`col-span-12 md:col-span-3 lg:col-span-2 ${
            sidebarOpen ? "" : "hidden md:block"
          }`}
        >
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft">
            {/* topo com marca do produto (FETRAF) e botão */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {imgOk ? (
                  <Image
                    src="/fetraf.png"       // marca institucional do sistema
                    alt="FETRAF"
                    width={28}
                    height={28}
                    className="rounded"
                    priority
                    unoptimized
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <Image src="/fetraf.png" alt="FETRAF" width={28} height={28} />
                )}
                <span className="text-sm font-semibold">FETRAF</span>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--surface-2)]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Alternar menu"
              >
                <Menu size={18} />
              </button>
            </div>

            {/* navegação */}
            <nav>
              <ul className="space-y-1">
                <NavItem href="/dashboard" icon={Home} label="Visão geral" />
                <NavItem href="/dashboard/filiados" icon={Users} label="Filiados" />
                <NavItem href="/dashboard/sindicatos" icon={Landmark} label="Sindicatos" />
                <NavItem href="/dashboard/contribuicoes" icon={DollarSign} label="Contribuições" />
                <NavItem href="/dashboard/relatorios" icon={FileText} label="Relatórios" />
                <NavItem href="/dashboard/configuracoes" icon={Settings} label="Configurações" />
              </ul>
            </nav>

            {/* rodapé da sidebar: usuário e tema (sem crédito de desenvolvedor aqui) */}
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[color-mix(in_oklch,var(--fg),var(--surface)_80%)]/10 text-xs font-semibold">
                    AP
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm">Alexandre</p>
                    <p className="text-xs text-[var(--muted)]">Admin • FETRAF</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard/configuracoes?tab=geral" className="btn flex-1">
                  Perfil
                </Link>
                <button
                  type="button"
                  className="btn"
                  aria-label="Sair"
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", { method: "POST" });
                    } catch {}
                    window.location.href = "/login";
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {/* Topbar com busca/ações */}
          <div className="sticky top-4 z-10 mb-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-soft">
            <div className="relative w-full md:w-1/2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                size={18}
              />
              <input
                className="input pl-10"
                placeholder="Pesquisar por filiados, sindicatos, CPF..."
              />
            </div>

            <Link href="/dashboard/filiados/novo" className="btn-brand">
              Novo Filiado
            </Link>

            <button type="button" className="btn" aria-label="Notificações">
              <Bell size={18} />
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

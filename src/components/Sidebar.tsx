"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Landmark,
  DollarSign,
  FileText,
  Settings,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle"; // ajuste o caminho se seu ThemeToggle estiver em outro lugar

type IconType = typeof Home;

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: IconType;
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
          active
            ? "bg-[var(--surface-2)] font-medium"
            : "text-[var(--muted)]",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  // restaura preferência de abertura do menu
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shell:sidebarOpen");
      if (saved !== null) setOpen(saved === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("shell:sidebarOpen", open ? "1" : "0");
    } catch {}
  }, [open]);

  return (
    <aside className={`col-span-12 md:col-span-3 lg:col-span-2 ${open ? "" : "hidden md:block"}`}>
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft">
        {/* Topo: logo + botão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* A imagem precisa existir em /public/fetraf.png */}
            <Image
              src="/fetraf.png"
              alt="FETRAF"
              width={28}
              height={28}
              className="rounded"
              priority
            />
            <span className="text-sm font-semibold">FETRAF</span>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--surface-2)]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Alternar menu"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="mt-1">
          <ul className="space-y-1">
            <NavItem href="/dashboard" label="Visão geral" icon={Home} />
            <NavItem href="/dashboard/filiados" label="Filiados" icon={Users} />
            <NavItem href="/dashboard/sindicatos" label="Sindicatos" icon={Landmark} />
            <NavItem href="/dashboard/contribuicoes" label="Contribuições" icon={DollarSign} />
            <NavItem href="/dashboard/relatorios" label="Relatórios" icon={FileText} />
            <NavItem href="/dashboard/configuracoes" label="Configurações" icon={Settings} />
          </ul>
        </nav>

        {/* Rodapé: ações rápidas */}
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
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch {}
                window.location.href = "/login";
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

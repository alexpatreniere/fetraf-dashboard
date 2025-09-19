// app/layout.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sistema FETRAF",
  description: "Painel administrativo",
};

function BrandFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-10 w-full max-w-[1400px] px-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        {/* Copyright FETRAF (dona do sistema) */}
        <span>© {year} FETRAF. Todos os direitos reservados.</span>

        {/* Crédito discreto da desenvolvedora (Uptech) */}
        <Link
          href="https://uptech.dev.br" // ajuste se quiser
          target="_blank"
          className="inline-flex items-center gap-2 hover:opacity-90"
          aria-label="Desenvolvido por Uptech"
        >
          {/* wordmark com troca automática claro/escuro */}
          <span className="relative inline-block h-4 w-[96px] opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/uptech-wordmark-dark.svg"
              alt="Uptech"
              fill
              className="object-contain dark:hidden"
              unoptimized
              priority={false}
            />
            <Image
              src="/uptech-wordmark-light.svg"
              alt="Uptech"
              fill
              className="hidden object-contain dark:block"
              unoptimized
              priority={false}
            />
          </span>
          <span className="whitespace-nowrap">Desenvolvido por Uptech</span>
        </Link>
      </div>
    </footer>
  );
}

// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><meta charSet="utf-8" /></head>
      <body>{children}</body>
    </html>
  );
}


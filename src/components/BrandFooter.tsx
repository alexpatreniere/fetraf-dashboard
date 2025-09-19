// Server Component (sem "use client")
import Image from "next/image";
import Link from "next/link";

export default function BrandFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-10 w-full max-w-[1400px] px-4">
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-2">
          {/* Copyright FETRAF */}
          <span>© {year} FETRAF. Todos os direitos reservados.</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">Desenvolvido por</span>
          <Link
            href="https://sua-empresa.com" // 🔁 troque pelo link da sua empresa
            className="inline-flex items-center gap-2 hover:opacity-90"
            aria-label="Site da empresa desenvolvedora"
            target="_blank"
          >
            <Image
              src="/company-logo.svg"      // 🔁 troque o caminho se desejar
              alt="Sua Empresa"
              width={18}
              height={18}
              className="rounded-sm"
              unoptimized
              priority={false}
            />
            <span className="font-medium text-[var(--fg)]">Sua Empresa</span> {/* 🔁 troque o nome */}
          </Link>
        </div>
      </div>
    </footer>
  );
}

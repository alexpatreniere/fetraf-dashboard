import Link from "next/link";

export default function DevBadge() {
  return (
    <div className="fixed bottom-3 right-3 z-[60]">
      <Link
        href="https://sua-empresa.com" // 🔁 troque
        target="_blank"
        className="rounded-full border border-[var(--border)] bg-[var(--surface)]/85 px-3 py-1.5 text-[11px] text-[var(--muted)] shadow-soft backdrop-blur hover:text-[var(--fg)] hover:bg-[var(--surface)]"
        aria-label="Desenvolvido por Sua Empresa"
      >
        desenvolvido por <span className="font-medium">Sua Empresa</span>
      </Link>
    </div>
  );
}

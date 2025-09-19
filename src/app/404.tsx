// app/404.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verifique o endereço ou volte ao início.
        </p>
        <div className="mt-6">
          <Link href="/dashboard" className="underline">
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

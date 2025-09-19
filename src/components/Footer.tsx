export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t mt-10">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {year} FETRAF — Todos os direitos reservados.</span>
        <span className="opacity-80">
          Desenvolvido por <a className="underline hover:opacity-100" href="https://uptech.com.br" target="_blank" rel="noreferrer">UpTech</a>
        </span>
      </div>
    </footer>
  );
}
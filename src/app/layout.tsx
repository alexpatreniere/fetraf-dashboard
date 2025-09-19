import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema FETRAF",
  description: "Federação dos Trabalhadores do Ramo Financeiro do RJ e ES",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
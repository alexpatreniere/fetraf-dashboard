// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistema FETRAF",
  description: "Painel administrativo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

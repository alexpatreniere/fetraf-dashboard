import Footer from "@/components/Footer";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema FETRAF",
  description: "Federação dos Trabalhadores do Ramo Financeiro do RJ e ES",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Footer />
      </body>
    </html>
  );
}
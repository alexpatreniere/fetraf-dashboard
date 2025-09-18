import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FETRAF Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

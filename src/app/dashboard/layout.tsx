import type { ReactNode } from "react";
import ClientShell from "@/components/dashboard/ClientShell"; // client component permitido aqui

export default function Layout({ children }: { children: ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}
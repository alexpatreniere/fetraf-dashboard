import type { ReactNode } from "react";
import ClientShell from "@/components/dashboard/ClientShell";
export default function Layout({ children }: { children: ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
}

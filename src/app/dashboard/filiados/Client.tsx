"use client";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function FiliadosClient() {
  return (
    <PageLayout>
      <PageHeader
        title="Filiados"
        subtitle="Gerencie os filiados"
        actions={
          <Link className="btn" href="/dashboard/filiados/novo">
            Novo filiado
          </Link>
        }
      />
      <div className="card p-6 text-sm">
        Nenhum filiado carregado. Implemente a listagem aqui.
      </div>
    </PageLayout>
  );
}

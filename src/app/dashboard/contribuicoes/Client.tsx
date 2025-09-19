"use client";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function ContribuicoesClient() {
  return (
    <PageLayout>
      <PageHeader
        title="Contribuições"
        subtitle="Listagem e ações de contribuições"
        actions={
          <Link className="btn" href="/dashboard/contribuicoes/nova">
            Nova contribuição
          </Link>
        }
      />
      <div className="card p-6 text-sm">
        Nenhuma contribuição carregada. Implemente a listagem aqui.
      </div>
    </PageLayout>
  );
}

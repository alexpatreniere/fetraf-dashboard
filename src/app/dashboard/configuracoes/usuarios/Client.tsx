"use client";

import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function UsuariosClient() {
  return (
    <PageLayout>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie contas e permissões"
        actions={
          <Link className="btn" href="/dashboard/configuracoes/usuarios/novo">
            Novo usuário
          </Link>
        }
      />
      <div className="card p-6 text-sm">
        Lista de usuários em construção. Implemente a tabela aqui.
      </div>
    </PageLayout>
  );
}

// src/app/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  useEffect(() => {
    // opcional: log para observabilidade
    console.error(error);
  }, [error]);

  const message =
    error instanceof Error ? error.message : String(error ?? "Erro desconhecido");

  return (
    <html>
      <body className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md rounded-lg border bg-white p-6 shadow">
          <h1 className="mb-2 text-xl font-semibold">Ops, algo deu errado.</h1>
          <p className="mb-4 text-gray-700 break-words">{message}</p>
          <div className="flex gap-2">
            <button
              className="rounded bg-blue-600 px-3 py-2 text-white"
              onClick={() => reset()}
            >
              Tentar novamente
            </button>
            <button
              className="rounded border px-3 py-2"
              onClick={() => (window.location.href = "/")}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

import { NextResponse } from "next/server";

/** Store simulado (em memória) */
type ResetEntry = { email: string; token: string; expiresAt: number };

declare global {
  // precisamos declarar para o TS não reclamar
  // eslint-disable-next-line no-var
  var __reset_store__: Map<string, ResetEntry> | undefined;
}

const RESET_STORE: Map<string, ResetEntry> =
  globalThis.__reset_store__ ?? new Map();
globalThis.__reset_store__ = RESET_STORE;

/** Simula existir usuário com e-mail X */
function emailExiste(email: string) {
  // em produção: consulte seu DB
  return !!email && /@/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({} as any));
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });
    }

    // Geramos token mesmo que o e-mail não exista
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 min
    RESET_STORE.set(token, { email: email.toLowerCase(), token, expiresAt });

    // “Enviar” o link por e-mail (mock -> console)
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${base}/login/reset/${token}`;
    // eslint-disable-next-line no-console
    console.log("[RESET] Link de redefinição:", resetUrl, "->", email);

    // não revela se o e-mail existe
    if (!emailExiste(email)) {
      // não faz nada, só mantemos a resposta genérica
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado." }, { status: 500 });
  }
}

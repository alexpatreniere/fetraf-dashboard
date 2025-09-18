import { NextResponse } from "next/server";

type ResetEntry = { email: string; token: string; expiresAt: number };
const RESET_STORE: Map<string, ResetEntry> = (globalThis as any).__reset_store__ ?? new Map();
(globalThis as any).__reset_store__ = RESET_STORE;

/** “Banco” de senhas em memória — APENAS DEV */
const PASSWORDS: Map<string, string> = (globalThis as any).__passwords__ ?? new Map();
(globalThis as any).__passwords__ = PASSWORDS;

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json().catch(() => ({} as any));
    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, error: "Token ausente." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Senha inválida (mín. 8 caracteres)." }, { status: 400 });
    }

    const entry = RESET_STORE.get(token);
    if (!entry) {
      return NextResponse.json({ ok: false, error: "Token inválido." }, { status: 400 });
    }
    if (Date.now() > entry.expiresAt) {
      RESET_STORE.delete(token);
      return NextResponse.json({ ok: false, error: "Token expirado." }, { status: 400 });
    }

    // “Persistir” nova senha (em memória)
    PASSWORDS.set(entry.email, password);
    // Invalida o token após uso
    RESET_STORE.delete(token);

    // eslint-disable-next-line no-console
    console.log(`[RESET] Senha atualizada para ${entry.email} (apenas DEV).`);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado." }, { status: 500 });
  }
}

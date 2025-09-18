import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const VALID_EMAIL = "admin@fetraf.local";
const VALID_PASSWORDS = new Set(["admin", "123456"]);
const SESSION_COOKIE = "fetraf_session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = (body?.email || "").toString().trim().toLowerCase();
    const password = (body?.password || "").toString();

    const ok = email === VALID_EMAIL && VALID_PASSWORDS.has(password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
    }

    (await cookies()).set({
      name: SESSION_COOKIE,
      value: "ok",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true, user: { email: VALID_EMAIL, name: "Admin FETRAF" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "fetraf_session";

export async function POST() {
  try {
    const c = cookies();
    // Invalida o cookie
    (await
      // Invalida o cookie
      c).set({
      name: SESSION_COOKIE,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erro inesperado." },
      { status: 500 },
    );
  }
}

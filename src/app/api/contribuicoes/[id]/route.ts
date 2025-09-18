import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function toResponse(r: Response, text: string) {
  const isJson = (r.headers.get("content-type") || "").includes("application/json");
  return new NextResponse(isJson ? text : JSON.stringify({ raw: text }), {
    status: r.status,
    headers: isJson ? { "content-type": "application/json" } : undefined,
  });
}

// 🔧 Next 15: o segundo argumento agora tipa params como Promise<...>
// Precisamos "await" para extrair o id
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const r = await fetch(`${API}/contribuicoes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(`${API}/contribuicoes/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(`${API}/contribuicoes/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const r = await fetch(`${API}/contribuicoes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  return toResponse(r, text);
}

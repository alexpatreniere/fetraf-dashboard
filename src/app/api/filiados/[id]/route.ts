import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function toResponse(r: Response, text: string) {
  const isJson = (r.headers.get("content-type") || "").includes("application/json");
  return new NextResponse(isJson ? text : JSON.stringify({ raw: text }), {
    status: r.status,
    headers: isJson ? { "content-type": "application/json" } : undefined,
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const r = await fetch(`${API}/filiados/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(`${API}/filiados/${params.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body,
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(`${API}/filiados/${params.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body,
  });
  const text = await r.text();
  return toResponse(r, text);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });

  const r = await fetch(`${API}/filiados/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await r.text();
  return toResponse(r, text);
}

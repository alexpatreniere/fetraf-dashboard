import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function toResponse(r: Response, text: string) {
  const isJson = (r.headers.get("content-type") || "").includes("application/json");
  return new NextResponse(isJson ? text : JSON.stringify({ raw: text }), {
    status: r.status,
    headers: isJson ? { "content-type": "application/json" } : undefined,
  });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok:false, error:"sem token" }, { status:401 });
  const qs = new URL(req.url).search;
  const r = await fetch(`${API}/usuarios${qs}`, { headers:{ Authorization:`Bearer ${token}` }});
  const text = await r.text();
  return toResponse(r, text);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok:false, error:"sem token" }, { status:401 });
  const body = await req.text();
  const r = await fetch(`${API}/usuarios`, {
    method:"POST",
    headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
    body
  });
  const text = await r.text();
  return toResponse(r, text);
}

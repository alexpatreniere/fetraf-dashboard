import { NextRequest, NextResponse } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function POST(req: NextRequest, { params }: { params:{ id:string }}) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ ok:false, error:"sem token" }, { status:401 });
  const r = await fetch(`${API}/usuarios/${params.id}/reset`, {
    method:"POST",
    headers:{ Authorization:`Bearer ${token}` }
  });
  const text = await r.text();
  const isJson = (r.headers.get("content-type") || "").includes("application/json");
  return new NextResponse(isJson ? text : JSON.stringify({ raw: text }), {
    status: r.status,
    headers: isJson ? { "content-type":"application/json" } : undefined
  });
}

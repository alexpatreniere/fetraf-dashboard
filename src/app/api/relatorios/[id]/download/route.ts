import { NextRequest } from "next/server";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return new Response(JSON.stringify({ ok: false, error: "sem token" }), {
    status: 401, headers: { "content-type": "application/json" }
  });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "csv";
  const upstream = await fetch(`${API}/relatorios/${params.id}/download?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Passa o corpo como stream e preserva content-type/disposition
  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  const cd = upstream.headers.get("content-disposition") || `attachment; filename="relatorio-${params.id}.${format}"`;
  if (ct) headers.set("content-type", ct);
  headers.set("content-disposition", cd);

  return new Response(upstream.body, { status: upstream.status, headers });
}

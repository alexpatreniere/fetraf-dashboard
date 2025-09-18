import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
const token = req.cookies.get("auth_token")?.value;
if (!token) return NextResponse.json({ ok: false, error: "sem token" }, { status: 401 });
const r = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
const body = await r.text();
return new NextResponse(body, { status: r.status });
}
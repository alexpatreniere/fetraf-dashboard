import { NextRequest, NextResponse } from "next/server";


const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
const LOGIN_PATH = process.env.FETRAF_AUTH_LOGIN_PATH || "/auth/login";


async function tryFetch(url: string, init: RequestInit) {
const res = await fetch(url, init);
let body: any = null;
try { body = await res.clone().json(); } catch { try { body = await res.text(); } catch {} }
return { ok: res.ok, status: res.status, body };
}


function extractToken(data: any): string | null {
return (
data?.token?.token ||
data?.token ||
data?.access_token ||
data?.jwt ||
data?.data?.token ||
null
);
}


export async function POST(req: NextRequest) {
try {
let payload = {} as any;
try { payload = await req.json(); } catch {}


const email = payload.email ?? payload.uid ?? "";
const password = payload.password ?? "";


const candidates: Array<RequestInit> = [
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
},
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ uid: email, password }),
},
{
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: new URLSearchParams({ email, password }).toString(),
},
{
method: "POST",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: new URLSearchParams({ uid: email, password }).toString(),
},
];


let last: any = null;
for (const init of candidates) {
const { ok, status, body } = await tryFetch(`${API}${LOGIN_PATH}`, init);
last = { status, body };
if (!ok) continue;
const token = extractToken(body);
if (!token) continue;
const res = NextResponse.json({ ok: true });
res.cookies.set("auth_token", token, {
httpOnly: true,
sameSite: "lax",
secure: process.env.NODE_ENV === "production",
path: "/",
maxAge: 60 * 60 * 8,
});
return res;
}


return NextResponse.json(
{ ok: false, error: "Credenciais inválidas ou API rejeitou o login", detail: last },
{ status: 401 }
);
} catch (e: any) {
return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 400 });
}
}
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("NÃ£o autorizado");
  }
  return res;
}

// Ãºtil para pÃ¡ginas client-side
export function requireAuthClient() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  if (!token) location.href = "/login";
}

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // Se API_BASE for setado, usamos o backend (ex.: https://api.../auth/me),
  // senão caímos nas rotas do Next (ex.: /api/auth/me).
  if (API_BASE) {
    return `${API_BASE}${p.replace(/^\/api\//, "/")}`; // troca /api/auth -> /auth
  }
  return p;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiUrl(path);
  const res = await fetch(url, { credentials: "include", ...(init || {}) });
  return res;
}

export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | any }> {
  const res = await apiFetch(path, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  const data = ct.includes("application/json") ? JSON.parse(text) : { raw: text };
  return { ok: res.ok, status: res.status, data };
}

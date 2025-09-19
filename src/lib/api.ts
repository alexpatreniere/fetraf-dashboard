export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/** Monta URL final: se houver API_BASE, troca /api/... por ... e usa backend; senão usa a rota do Next */
export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE) {
    // Ex.: /api/auth/login -> /auth/login
    return `${API_BASE}${p.replace(/^\/api\//, "/")}`;
  }
  return p;
}

/** fetch com credentials incluídas (cookies) por padrão */
export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiUrl(path);
  const res = await fetch(url, { credentials: "include", ...(init || {}) });
  return res;
}

/** Helper que tenta parsear JSON e retorna status/ok/data */
export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | any }> {
  const res = await apiFetch(path, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  const data = ct.includes("application/json") ? JSON.parse(text) : { raw: text };
  return { ok: res.ok, status: res.status, data };
}
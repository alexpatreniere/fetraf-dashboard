export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Não autorizado");
  }
  return res;
}

// útil para páginas client-side
export function requireAuthClient() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  if (!token) location.href = "/login";
}

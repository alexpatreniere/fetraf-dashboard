"use client";

import { useCallback, useEffect, useState } from "react";
import { apiJson } from "./api";

export type Me = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  [k: string]: any;
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Se houver API_BASE, chamamos /auth/me; senão usamos /api/auth/me
      const { ok, status, data } = await apiJson("/api/auth/me", { cache: "no-store" });
      if (!ok) {
        const msg = data?.message || data?.error || `HTTP ${status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      setMe(data);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar perfil (auth/me).");
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { me, loading, error, refresh: load };
}
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Alternador de tema (system → light → dark).
 * Requer <ThemeProvider attribute="class" defaultTheme="system"> em layout.tsx.
 */
export function ThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Evita mismatch de hidratação
  if (!mounted) {
    return (
      <button className="btn h-9 px-3" type="button" aria-label="Tema" title="Tema">
        <Monitor size={18} />
        <span className="hidden sm:inline">Tema</span>
      </button>
    );
  }

  const current = theme === "system" ? (systemTheme as "light" | "dark" | undefined) : (theme as "light" | "dark");
  const isDark = current === "dark";

  const Icon = theme === "system" ? Monitor : isDark ? Moon : Sun;
  const label = theme === "system" ? "Sistema" : isDark ? "Escuro" : "Claro";

  function cycle() {
    // system -> light -> dark -> system
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  return (
    <button
      type="button"
      className="btn h-9 px-3"
      onClick={cycle}
      aria-label={`Alternar tema (atual: ${label})`}
      title={`Tema: ${label} — clique para alternar`}
      aria-pressed={isDark}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">Tema</span>
    </button>
  );
}

export default ThemeToggle;

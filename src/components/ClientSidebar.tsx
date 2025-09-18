// src/components/ClientSidebar.tsx  (CLIENT)
"use client";

import { useRouter } from "next/navigation";

export default function ClientSidebar() {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="p-4 border-t">
      <button
        className="mt-2 w-full rounded bg-red-600 px-3 py-2 text-white"
        onClick={handleLogout}
      >
        Sair
      </button>
    </div>
  );
}



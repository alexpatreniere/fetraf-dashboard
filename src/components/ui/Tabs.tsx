"use client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";


type Tab = { label: string; value: string; href?: string };


export function Tabs({ tabs, value, onChange }:{ tabs:Tab[]; value?:string; onChange?:(v:string)=>void; }){
const router = useRouter();
const pathname = usePathname();
return (
<div className="flex gap-2 border-b border-[var(--border)]">
{tabs.map((t)=>{
const active = (value ?? pathname?.split("/").at(-1)) === t.value;
return (
<button
key={t.value}
className={`px-3 py-2 text-sm rounded-t-lg border-b-2 ${active?"border-[var(--brand)] text-[var(--text)]":"border-transparent text-[var(--muted)] hover:text-[var(--text)]"}`}
onClick={()=> t.href ? router.push(t.href) : onChange?.(t.value)}
>{t.label}</button>
);
})}
</div>
);
}
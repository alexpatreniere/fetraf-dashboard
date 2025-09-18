"use client";
import { useMemo } from "react";


type Col<T> = { key: keyof T; header: string; render?: (row:T)=>React.ReactNode };


export default function DataTable<T extends { id: string|number }>({ data, columns }:{ data:T[]; columns:Col<T>[]; }){
const cols = useMemo(()=>columns, [columns]);
return (
<div className="card overflow-x-auto">
<table className="w-full text-sm">
<thead>
<tr className="text-left text-[var(--muted)]">
{cols.map(c=> <th key={String(c.key)} className="py-2.5 px-2 border-b border-[var(--border)] font-medium">{c.header}</th>)}
</tr>
</thead>
<tbody>
{data.map(row=> (
<tr key={row.id} className="hover:bg-[var(--surface-3)]">
{cols.map(c=> (
<td key={String(c.key)} className="py-2.5 px-2 border-b border-[var(--border)]">
{c.render ? c.render(row) : String(row[c.key])}
</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);
}
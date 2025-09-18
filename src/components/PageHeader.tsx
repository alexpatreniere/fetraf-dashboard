export function PageHeader({ title, subtitle, actions }:{ title:string; subtitle?:string; actions?:React.ReactNode }){
return (
<div className="mb-4 md:mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
<div>
<h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
{subtitle && <p className="muted mt-1">{subtitle}</p>}
</div>
{actions}
</div>
);
}
export function TableActions({ onAdd }:{ onAdd?:()=>void }){
return (
<div className="flex items-center gap-2">
<button className="btn" onClick={()=>location.reload()}>Recarregar</button>
<button className="btn btn-brand" onClick={onAdd}>Novo</button>
</div>
);
}
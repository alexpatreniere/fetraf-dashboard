"use client";
import { useState } from "react";
export default function LoginPage(){
  const [email,setEmail]=useState("admin@fetraf.local");
  const [password,setPassword]=useState("");
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>
      <form style={{width:360, padding:24, border:"1px solid #e5e7eb", borderRadius:12, background:"#fff"}}>
        <h1 style={{fontSize:20, fontWeight:600, marginBottom:8}}>Sistema FETRAF</h1>
        <p style={{fontSize:12, color:"#6b7280", marginBottom:16}}>Federação dos Trabalhadores do Ramo Financeiro do RJ e ES</p>
        <label style={{fontSize:12}}>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%", padding:8, margin:"4px 0 12px", border:"1px solid #d1d5db", borderRadius:8}} />
        <label style={{fontSize:12}}>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%", padding:8, margin:"4px 0 16px", border:"1px solid #d1d5db", borderRadius:8}} />
        <button type="submit" style={{width:"100%", padding:10, background:"#2563eb", color:"#fff", borderRadius:8, border:0}}>Entrar</button>
      </form>
    </div>
  );
}
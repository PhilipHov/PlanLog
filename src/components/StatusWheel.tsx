import { useMemo } from "react";
import type { GenerelState } from "../types";

export default function StatusWheel({ e }:{ e:GenerelState }){
  const score = useMemo(()=>{
    const s=(o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
    const total=s(e.personel.officerer)+s(e.personel.befalingsmænd)+s(e.personel.øvrige);
    const p = Math.min(100, Math.round(100*total/(e.personel.mål||1)));
    const m = e.materiel.våben>0 ? 100 : 60;
    const u = Math.round((e.uddannelse.stående+e.uddannelse.uddannelsesenhed)/2);
    return Math.round(p*0.5 + m*0.25 + u*0.25);
  },[e]);
  const color = score>=80?"#22c55e":score>=60?"#f59e0b":"#ef4444";
  return (
    <div style={{display:"grid",placeItems:"center",width:160,height:160,borderRadius:"50%",border:`10px solid ${color}`, color:"#dbe7ff"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:24,fontWeight:700}}>{score}%</div>
        <div style={{fontSize:12,opacity:.8}}>Hærens tilstand</div>
      </div>
    </div>
  );
}


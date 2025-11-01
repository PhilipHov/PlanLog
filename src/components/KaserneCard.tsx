import type { GenerelState } from "../types";
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

function pctReady(e: GenerelState){
  const sum = (o:Record<string,number>) => Object.values(o).reduce((a,b)=>a+b,0);
  const total = sum(e.personel.officerer)+sum(e.personel.befalingsmænd)+sum(e.personel.øvrige);
  return Math.round(100 * total / Math.max(1, e.personel.mål));
}

function pillColor(p:number){
  if (p >= 90) return "#16a34a"; // grøn
  if (p >= 70) return "#f59e0b"; // gul
  return "#ef4444";              // rød
}

export default function KaserneCard({
  e, onOpen, pinned, onTogglePin
}:{ e:GenerelState; onOpen:(id:string)=>void; pinned?:boolean; onTogglePin?:(id:string)=>void }){
  const ready = pctReady(e);
  const hist = (e.historyReadiness?.length ? e.historyReadiness : [55,62,61,68,72,74,ready])
    .map((v,i)=>({ name:`U${i+1}`, v }));

  const mangel = Math.max(0, e.personel.mål - Math.round(ready * e.personel.mål / 100));

  return (
    <div style={{borderRadius:"16px",border:"1px solid #22314f",background:"#0f172a",padding:"16px",boxShadow:"0 4px 6px rgba(0,0,0,0.3)",minHeight:"220px"}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",color:"#cbd5e1"}}>Garnison</div>
          <div style={{fontWeight:600,color:"#f1f5f9"}}>{e.navn}</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button
            onClick={()=>onTogglePin?.(e.id)}
            title={pinned?"Fjern fra favoritter":"Føj til favoritter"}
            style={{fontSize:"12px",border:"1px solid #2b3b5f",padding:"4px 8px",borderRadius:"6px",background:"#0e1a33",color:"#fde047",cursor:"pointer"}}
          >
            {pinned ? "★" : "☆"}
          </button>
          <button
            onClick={()=>onOpen(e.id)}
            style={{fontSize:"12px",border:"1px solid #2b3b5f",padding:"4px 8px",borderRadius:"6px",background:"#0e1a33",color:"#bfdbfe",cursor:"pointer"}}
          >
            Detaljer →
          </button>
        </div>
      </div>

      {/* kpi række */}
      <div style={{marginTop:"12px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"8px"}}>
        <div>
          <div style={{fontSize:"11px",color:"#cbd5e1"}}>Readiness</div>
          <div style={{fontSize:"24px",fontWeight:700,color:pillColor(ready)}}>{ready}%</div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"#cbd5e1"}}>Personel</div>
          <div style={{fontSize:"14px",color:"#f1f5f9"}}>
            {Math.round(ready*e.personel.mål/100)} / {e.personel.mål}
          </div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"#cbd5e1"}}>Materiel (våben)</div>
          <div style={{fontSize:"14px",color:"#f1f5f9"}}>{e.materiel.våben}</div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:"#cbd5e1"}}>Terræn</div>
          <div style={{fontSize:"14px",color:"#f1f5f9"}}>{e.materiel.terræn}</div>
        </div>
      </div>

      {/* micro chart */}
      <div style={{marginTop:"12px",height:"80px"}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#22314f"/>
            <XAxis dataKey="name" hide />
            <YAxis domain={[0,100]} hide />
            <Tooltip />
            <Line type="monotone" dataKey="v" strokeWidth={2} dot={false} stroke="#3b82f6"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* bundlinje med badges */}
      <div style={{marginTop:"12px",display:"flex",flexWrap:"wrap",gap:"8px",fontSize:"12px"}}>
        <span style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid #2b3b5f",background:"#0e1a33",color:"#bfdbfe"}}>
          Udd.: {e.uddannelse.stående}% / {e.uddannelse.uddannelsesenhed}%
        </span>
        <span style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid #2b3b5f",background:"#0e1a33",color:"#fda4af"}}>
          Mangler: {mangel}
        </span>
        {(() => {
          const andetCount = Array.isArray(e.andet) 
            ? e.andet.length 
            : (typeof e.andet === 'object' && e.andet?.events ? e.andet.events.length : 0);
          return andetCount > 0 ? (
            <span style={{padding:"4px 8px",borderRadius:"6px",border:"1px solid #2b3b5f",background:"#0e1a33",color:"#a7f3d0"}}>
              Events: {andetCount}
            </span>
          ) : null;
        })()}
      </div>
    </div>
  );
}

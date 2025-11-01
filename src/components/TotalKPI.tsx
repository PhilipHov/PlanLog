import type { GenerelState } from "../types";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

function pctReady(e: GenerelState){
  const s=(o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
  const tot=s(e.personel.officerer)+s(e.personel.befalingsmænd)+s(e.personel.øvrige);
  return Math.round(100*tot/Math.max(1,e.personel.mål));
}

function Card({title, value, sub}:{title:string; value:string; sub?:string;}){
  return (
    <div style={{borderRadius:"16px",border:"1px solid #22314f",background:"#0f172a",padding:"16px",minWidth:"220px"}}>
      <div style={{fontSize:"12px",color:"#cbd5e1"}}>{title}</div>
      <div style={{fontSize:"24px",fontWeight:700,color:"#f1f5f9"}}>{value}</div>
      {sub && <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"4px"}}>{sub}</div>}
    </div>
  );
}

export default function TotalKPI({ total }:{ total: GenerelState }){
  const readiness = pctReady(total);
  const hist = (total.historyReadiness?.length? total.historyReadiness : [60,62,68,71,75,78,readiness])
    .map((v,i)=>({ name:`U${i+1}`, v }));

  // budget fra data eller placeholder
  const budget = total.budget || { used: 52300, cap: 55000, weeklySpend: [] };
  const spend = budget.used;
  const cap = budget.cap;
  const diff = spend - cap;

  return (
    <div style={{display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"stretch"}}>
      <Card title="Readiness (total)" value={`${readiness}%`} sub="Aggregeret efter bemanding/måltal" />
      <Card title="Personel (actual/mål)"
            value={`${Math.round(readiness*total.personel.mål/100)} / ${total.personel.mål}`} />
      <Card title="Materiel (våben/terræn)"
            value={`${total.materiel.våben} / ${total.materiel.terræn}`} />
      <Card title="Budget vs forbrug"
            value={`${spend.toLocaleString()} / ${cap.toLocaleString()} kr`}
            sub={`${diff >= 0 ? "▲" : "▼"} ${Math.abs(diff).toLocaleString()} kr`} />
      <div style={{borderRadius:"16px",border:"1px solid #22314f",background:"#0f172a",padding:"16px",flex:1,minWidth:"280px"}}>
        <div style={{fontSize:"12px",color:"#cbd5e1",marginBottom:"8px"}}>Trend (seneste uger)</div>
        <div style={{height:90}}>
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
      </div>
    </div>
  );
}


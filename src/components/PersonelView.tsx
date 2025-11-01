import { useMemo, useState } from "react";
import type { GenerelState, PersonelDetail, UnitType } from "../types";
import { recruitmentSuggestions } from "../utils/predictive";

function pct(cur:number, need:number){ return Math.round(100*cur/Math.max(1,need)); }

function Row({label, cur, need}:{label:string; cur:number; need:number}){
  const p = pct(cur,need);
  const color = p>=100?"#22c55e":p>=70?"#f59e0b":"#ef4444";
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">{cur} / {need}</div>
      <div className="small" style={{color}}>{p}%</div>
    </div>
  );
}

function BlockTable({ title, block }:{ title:string; block:Record<string,{current:number;need:number}> }){
  return (
    <div className="section">
      <h4 style={{margin:"6px 0"}}>{title}</h4>
      {Object.entries(block).map(([k,v])=>(
        <Row key={k} label={k} cur={v.current} need={v.need}/>
      ))}
    </div>
  );
}

export default function PersonelView({ e, onChange:_onChange }:{ e:GenerelState; onChange:(e:GenerelState)=>void }){
  const [unit, setUnit] = useState<UnitType>("stående");

  const detail: PersonelDetail | undefined = useMemo(()=> e.personel.details?.find(d=>d.unit===unit), [e,unit]);

  // top-KPI (samlet)
  const sum = (o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
  const totalActual = sum(e.personel.officerer)+sum(e.personel.befalingsmænd)+sum(e.personel.øvrige);
  const totalNeed   = e.personel.mål;
  const totalPct    = pct(totalActual,totalNeed);
  const suggestions = recruitmentSuggestions(e);

  return (
    <>
      <div className="section">
        <div className="kpi">
          <div className="pill">Tilgængeligt: <b>{totalActual}</b></div>
          <div className="pill">Behov: <b>{totalNeed}</b></div>
          <div className="pill">Opfyldelse: <b style={{color: totalPct>=100?"var(--ok)": totalPct>=70?"#f59e0b":"var(--bad)"}}>
            {totalPct}%</b></div>
        </div>
      </div>

      <div className="section">
        <div className="tabbar">
          {(["stående","værnepligt"] as UnitType[]).map(u=>(
            <button key={u} className={"tabbtn"+(unit===u?" active":"")} onClick={()=>setUnit(u)}>
              {u==="stående"?"Stående":"Værnepligtige"}
            </button>
          ))}
        </div>

        {detail ? (
          <>
            <BlockTable title="Officerer"     block={detail.officerer}/>
            <BlockTable title="Befalingsmænd" block={detail.befalingsmænd}/>
            <BlockTable title="Øvrige"        block={detail.øvrige}/>
          </>
        ): <div className="pill">Ingen detaljer registreret for denne enhedstype.</div>}
      </div>

      {suggestions.length > 0 && (
        <div className="section">
          <h3>AI – Rekrutteringsforslag (top 3 gaps)</h3>
          {suggestions.map((s, i) => (
            <div className="row" key={i}>
              <div className="label">{s.rank}</div>
              <div className="value">{s.gap} mangler</div>
              <div className="small" style={{color: s.pct >= 70 ? "#22c55e" : s.pct >= 50 ? "#f59e0b" : "#ef4444"}}>
                {s.pct}% opfyldt
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}


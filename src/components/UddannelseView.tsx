import { useMemo, useState } from "react";
import type { GenerelState, UnitType } from "../types";
import { certificationETA } from "../utils/predictive";

function etaWeeks(progress:number, tempo:number){
  if (tempo<=0) return Infinity;
  const remain = Math.max(0, 100 - progress);
  return Math.ceil(remain / tempo);
}

export default function UddannelseView({ e }:{ e:GenerelState }){
  const [unit, setUnit] = useState<UnitType>("stående");
  const plan = useMemo(()=> e.uddannelse.planer?.find(p=>p.unit===unit), [e,unit]);
  const certETA = useMemo(()=> plan ? certificationETA(plan) : { slowest: null, all: [] }, [plan]);

  return (
    <>
      <div className="section">
        <div className="tabbar">
          {(["stående","værnepligt"] as UnitType[]).map(u=>(
            <button key={u} className={"tabbtn"+(unit===u?" active":"")} onClick={()=>setUnit(u)}>
              {u==="stående"?"Stående":"Værnepligtige"}
            </button>
          ))}
        </div>
      </div>

      {plan ? (
        <>
          <div className="section">
            <h3>Fag & progression</h3>
            {plan.fag.map(f=>{
              const weeks = etaWeeks(f.progressPct, f.tempoPctPrUge);
              const isSlowest = certETA.slowest?.navn === f.navn;
              return (
                <div className="row" key={f.navn} style={isSlowest ? {background:"rgba(239,68,68,0.1)"} : {}}>
                  <div className="label">
                    {f.navn}
                    {isSlowest && <span style={{marginLeft:8,color:"#ef4444",fontSize:"11px"}}>(Flaskehals)</span>}
                  </div>
                  <div className="value">{f.progressPct}%</div>
                  <div className="small">{isFinite(weeks) ? `ETA: ~${weeks} uger` : "ETA: ukendt"}</div>
                </div>
              );
            })}
          </div>
          {certETA.slowest && (
            <div className="section">
              <h3>Flaskehals</h3>
              <div className="pill">
                <b>{certETA.slowest.navn}</b> bliver færdig om ~{certETA.slowest.weeks} uger
              </div>
            </div>
          )}
        </>
      ) : <div className="section"><div className="pill">Ingen uddannelsesplan registreret.</div></div>}
    </>
  );
}


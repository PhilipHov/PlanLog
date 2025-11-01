import type { GenerelState } from "../types";
import { computeAlerts } from "../utils/alerts";

export default function MeldingsFlow({ e }:{ e:GenerelState }){
  const alerts = computeAlerts(e);
  if(!alerts.length) return <div className="section"><div className="pill">Ingen kritiske meldinger</div></div>;
  return (
    <div className="section">
      <h3>Meldinger</h3>
      {alerts.map(a=>(
        <div className="row" key={a.id}>
          <div className="label">{a.text}</div>
          <div className="value"><button className="btn" onClick={()=>copy(a.text)}>Send G7</button></div>
          <div className="small">{a.level}</div>
        </div>
      ))}
    </div>
  );
}

function copy(t:string){ navigator.clipboard?.writeText(`MELDING: ${t}`); }


import type { GenerelState } from "../types";

export default function AndetView({ e }:{ e:GenerelState }){
  // Support både legacy array og nyt objekt format
  const andetData = typeof e.andet === 'object' && !Array.isArray(e.andet) 
    ? e.andet 
    : { events: Array.isArray(e.andet) ? e.andet.map(s => ({ title: s, dateISO: "" })) : [], moraleScore: undefined };

  return (
    <>
      {andetData.events && andetData.events.length > 0 && (
        <div className="section">
          <h3>Arrangementer</h3>
          {andetData.events.map((event, i) => (
            <div className="row" key={i}>
              <div className="label">
                {typeof event === 'string' ? event : event.title}
                {typeof event === 'object' && event.dateISO && (
                  <span className="small" style={{marginLeft:8}}>{event.dateISO}</span>
                )}
              </div>
              <div className="small">arr.</div>
            </div>
          ))}
        </div>
      )}

      {andetData.moraleScore !== undefined && (
        <div className="section">
          <h3>Morale Score</h3>
          <div className="kpi">
            <div className="pill">
              Score: <b style={{color: andetData.moraleScore >= 7 ? "#22c55e" : andetData.moraleScore >= 5 ? "#f59e0b" : "#ef4444"}}>
                {andetData.moraleScore.toFixed(1)}
              </b>
            </div>
          </div>
        </div>
      )}

      {(!andetData.events || andetData.events.length === 0) && andetData.moraleScore === undefined && (
        <div className="section">
          <div className="pill">Ingen data registreret</div>
        </div>
      )}
    </>
  );
}


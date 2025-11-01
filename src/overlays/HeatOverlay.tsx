import { Circle, LayerGroup } from "react-leaflet";
import type { GenerelState } from "../types";

export default function HeatOverlay({ enheder, visible }:{ enheder:GenerelState[]; visible:boolean }){
  if(!visible) return null;
  return (
    <LayerGroup>
      {enheder.map(e=>{
        const pct = readinessPct(e);
        const color = pct>=80 ? "green" : pct>=60 ? "orange" : "red";
        return <Circle key={e.id} center={[e.lat,e.lng]} radius={18000} pathOptions={{color, fillOpacity:0.15}} />;
      })}
    </LayerGroup>
  );
}

function readinessPct(e: GenerelState){
  const s=(o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
  const total=s(e.personel.officerer)+s(e.personel.befalingsmænd)+s(e.personel.øvrige);
  return Math.round(100*total/(e.personel.mål||1));
}


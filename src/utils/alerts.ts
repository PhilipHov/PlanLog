import type { GenerelState } from "../types";
export type Alert = { id:string; level:"green"|"yellow"|"red"; text:string };

export function computeAlerts(e: GenerelState): Alert[] {
  const total = tot(e);
  const pct = Math.round(100*total/(e.personel.mål||1));
  const alerts:Alert[]=[];
  if(pct<60) alerts.push({id:e.id+"-pers",level:"red",text:`Personel under 60% (${pct}%)`});
  else if(pct<80) alerts.push({id:e.id+"-pers",level:"yellow",text:`Personel mellem 60–80% (${pct}%)`});

  if(e.materiel.våben<=0) alerts.push({id:e.id+"-mat",level:"red",text:"Ingen våben registreret"});
  if(e.materiel.terræn<=0) alerts.push({id:e.id+"-ter",level:"yellow",text:"Intet terræn til rådighed"});
  return alerts;
}
function tot(e: GenerelState){
  const s=(o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
  return s(e.personel.officerer)+s(e.personel.befalingsmænd)+s(e.personel.øvrige);
}


import type { GenerelState } from "../types";

export function aggregate(enheder: GenerelState[]): GenerelState {
  const sum = (a:Record<string,number>, b:Record<string,number>)=>{
    const o={...a}; for(const [k,v] of Object.entries(b)) o[k]=(o[k]??0)+v; return o;
  };
  const base: GenerelState = {
    id:"total", navn:"TOTAL – Hæren", lat:56, lng:10,
    personel:{ officerer:{}, befalingsmænd:{}, øvrige:{}, mål:0 },
    materiel:{ bygninger:0, våben:0, terræn:0 },
    uddannelse:{ stående:0, uddannelsesenhed:0 },
    andet:[], historyReadiness:[]
  };
  let n=0;
  for(const e of enheder){
    base.personel.officerer=sum(base.personel.officerer,e.personel.officerer);
    base.personel.befalingsmænd=sum(base.personel.befalingsmænd,e.personel.befalingsmænd);
    base.personel.øvrige=sum(base.personel.øvrige,e.personel.øvrige);
    base.personel.mål+=e.personel.mål;
    base.materiel.bygninger+=e.materiel.bygninger;
    base.materiel.våben+=e.materiel.våben;
    base.materiel.terræn+=e.materiel.terræn;
    base.uddannelse.stående+=e.uddannelse.stående;
    base.uddannelse.uddannelsesenhed+=e.uddannelse.uddannelsesenhed;
    if(e.historyReadiness?.length) base.historyReadiness=(base.historyReadiness??[]).concat(e.historyReadiness);
    n++;
  }
  base.uddannelse.stående=Math.round(base.uddannelse.stående/Math.max(1,n));
  base.uddannelse.uddannelsesenhed=Math.round(base.uddannelse.uddannelsesenhed/Math.max(1,n));
  if(base.historyReadiness && base.historyReadiness.length>8) base.historyReadiness=base.historyReadiness.slice(-8);
  return base;
}


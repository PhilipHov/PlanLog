import type { GenerelState } from "../types";
import KaserneCard from "./KaserneCard";
import Select from "react-select";
import { useMemo, useState } from "react";
import { exportKasernerPDF } from "../utils/report";

type SortKey = "readiness" | "personel" | "våben";

function pctReady(e: GenerelState){
  const sum = (o:Record<string,number>) => Object.values(o).reduce((a,b)=>a+b,0);
  const total = sum(e.personel.officerer)+sum(e.personel.befalingsmænd)+sum(e.personel.øvrige);
  return Math.round(100 * total / Math.max(1, e.personel.mål));
}

const PIN_KEY = "haeren_pinned_ids";

export default function KaserneGrid({
  enheder,
  onOpen
}:{ enheder:GenerelState[]; onOpen:(id:string)=>void }){
  const [sortKey, setSortKey] = useState<SortKey>("readiness");
  const [query, setQuery] = useState("");

  const [pinned, setPinned] = useState<string[]>(()=>{
    try { return JSON.parse(localStorage.getItem(PIN_KEY) || "[]"); } catch { return []; }
  });
  const togglePin = (id:string)=>{
    setPinned(prev=>{
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      localStorage.setItem(PIN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const options = useMemo(()=>[
    { value:"readiness", label:"Readiness" },
    { value:"personel",  label:"Personel i alt" },
    { value:"våben",     label:"Våben" },
  ],[]);

  const withScore = useMemo(()=> enheder.map(e=>({ e, ready:pctReady(e) })), [enheder]);

  const filtered = useMemo(()=>{
    const q = query.toLowerCase();
    const arr = withScore.filter(x => x.e.navn.toLowerCase().includes(q));
    // sort efter pinned først
    arr.sort((a,b)=>{
      const ap = pinned.includes(a.e.id) ? 1 : 0;
      const bp = pinned.includes(b.e.id) ? 1 : 0;
      if (ap!==bp) return bp-ap; // pinned først
      if (sortKey==="readiness") return b.ready - a.ready;
      if (sortKey==="personel"){
        const av=Math.round(a.ready*a.e.personel.mål/100);
        const bv=Math.round(b.ready*b.e.personel.mål/100);
        return bv-av;
      }
      return b.e.materiel.våben - a.e.materiel.våben;
    });
    return arr.map(x=>x.e);
  }, [withScore, sortKey, query, pinned]);

  return (
    <div style={{padding:"12px",maxHeight:"70vh",overflowY:"auto"}}>
      {/* toolbar */}
      <div style={{marginBottom:"12px",display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center"}}>
        <input
          placeholder="Søg garnison…"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          style={{padding:"8px 12px",borderRadius:"8px",border:"1px solid #2b3b5f",background:"#0f1a34",color:"#f1f5f9"}}
        />
        <div style={{minWidth:220}}>
          <Select
            options={options}
            defaultValue={options[0]}
            onChange={(opt)=>setSortKey((opt?.value as SortKey) ?? "readiness")}
            styles={{
              control:(s)=>({...s, backgroundColor:"#0f1a34", borderColor:"#2b3b5f", color:"#dbe7ff"}),
              singleValue:(s)=>({...s, color:"#dbe7ff"}),
              menu:(s)=>({...s, background:"#0f1a34", color:"#dbe7ff"}),
              option:(s)=>({...s, backgroundColor:"#0f1a34", color:"#dbe7ff", "&:hover":{backgroundColor:"#1e293b"}}),
            }}
          />
        </div>
        {/* Export-knap */}
        <button className="btn" onClick={()=>exportKasernerPDF(filtered)}>
          Eksportér alle kaserner (PDF)
        </button>
      </div>

      {/* grid */}
      <div className="kaserne-grid" style={{gridTemplateColumns:"repeat(4, minmax(0,1fr))"}}>
        {filtered.map(e=>(
          <KaserneCard
            key={e.id}
            e={e}
            pinned={pinned.includes(e.id)}
            onTogglePin={togglePin}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

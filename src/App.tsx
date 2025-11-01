import { useMemo, useState } from "react";
import { enheder as seed } from "./data";
import { load, save } from "./storage";
import MapView from "./MapView";
import type { GenerelState } from "./types";
import { aggregate } from "./utils/aggregate";
import KaserneGrid from "./components/KaserneGrid";
import TotalKPI from "./components/TotalKPI";
import Dashboard from "./components/Dashboard";
import PersonelView from "./components/PersonelView";
import MaterielView from "./components/MaterielView";
import UddannelseView from "./components/UddannelseView";
import AndetView from "./components/AndetView";
import BeredskabView from "./components/BeredskabView";
import Sidebar from "./components/Sidebar";
import AppSection from "./components/AppSection";
import type { KPI } from "./utils/analytics";
import type { GarrisonReadiness } from "./utils/beredskab";

type Section = "dashboard"|"alle"|"personel"|"materiel"|"uddannelse"|"andet"|"beredskab";

export default function App(){
  const [state, setState] = useState<GenerelState[]>(()=>load<GenerelState[]>(seed));
  const total = useMemo(()=>aggregate(state),[state]);

  /* State for navigation */
  const [activeId, setActiveId] = useState<string>("total");     // hvem der vises i modal
  const [selectedId, setSelectedId] = useState<string>("");      // hvad der står i dropdown
  const [showModal, setShowModal] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");

  const active = useMemo(()=> activeId==="total" ? total : (state.find(e=>e.id===activeId) ?? total), [state, activeId, total]);

  // Convert GenerelState to KPI for Dashboard/MaterielView
  const activeKPI: KPI = useMemo(() => {
    const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
    const total = sum(active.personel.officerer) + sum(active.personel.befalingsmænd) + sum(active.personel.øvrige);
    const readiness = Math.round(100 * total / Math.max(1, active.personel.mål));
    const materielAny = active.materiel as any;
    
    return {
      readinessPct: readiness,
      personnelNow: total,
      personnelTarget: active.personel.mål,
      budgetUsed: active.budget?.used ?? 0,
      budgetCap: active.budget?.cap ?? 0,
      mtbfHours: materielAny?.mtbfHrs,
      slaPct: materielAny?.slaPct,
      anomalies: [] // Could be calculated from historyReadiness if needed
    };
  }, [active]);

  // Convert risks to binary format
  const activeRisks = useMemo(() => {
    if (!active.risks || active.risks.length === 0) return [];
    return active.risks.map(r => ({
      label: r.name,
      prob: (r.prob >= 3 ? 1 : 0) as 0 | 1,
      impact: (r.impact >= 3 ? 1 : 0) as 0 | 1
    }));
  }, [active.risks]);

  // Convert materiel data to MaterielView format
  const materielItems = useMemo(() => {
    const materielAny = active.materiel as any;
    const items: Array<{
      kategori: string;
      operativ: number;
      total: number;
      slaPct: number;
      mtbfHours: number;
      næsteService?: string;
      issues?: string[];
    }> = [];

    // Add våben kategori
    if (active.materiel.våben > 0) {
      const ready = active.materiel.critical?.find(c => c.name.includes("Rifler") || c.name.includes("Våben"))?.ready ?? 
                    Math.round(active.materiel.våben * 0.94);
      items.push({
        kategori: "Våben",
        operativ: ready,
        total: active.materiel.våben,
        slaPct: materielAny?.slaPct ?? 97,
        mtbfHours: materielAny?.mtbfHrs ?? 180,
        issues: ready < active.materiel.våben ? [`${active.materiel.våben - ready} ude af drift`] : undefined
      });
    }

    // Add køretøjer kategori
    const vehicles = active.materiel.critical?.find(c => c.name.includes("Køretøj") || c.name.includes("M113"));
    if (vehicles) {
      items.push({
        kategori: "Køretøjer",
        operativ: vehicles.ready,
        total: vehicles.total,
        slaPct: materielAny?.slaPct ?? 96,
        mtbfHours: materielAny?.mtbfHrs ?? 145,
        næsteService: active.materiel.maintenanceETAWeeks ? `uge ${Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24 * 7)) + active.materiel.maintenanceETAWeeks}` : undefined,
        issues: active.materiel.maintenanceOpen ? [`${active.materiel.maintenanceOpen} vedl. sager`] : undefined
      });
    }

    // Add kommunikation kategori
    const comms = active.materiel.critical?.find(c => c.name.includes("Radio") || c.name.includes("Kommunikation"));
    if (comms) {
      items.push({
        kategori: "Kommunikation",
        operativ: comms.ready,
        total: comms.total,
        slaPct: materielAny?.slaPct ?? 92,
        mtbfHours: materielAny?.mtbfHrs ?? 120
      });
    }

    // Add bygninger kategori
    if (active.materiel.bygninger > 0) {
      items.push({
        kategori: "Bygninger",
        operativ: active.materiel.bygninger,
        total: active.materiel.bygninger,
        slaPct: 100,
        mtbfHours: Infinity,
        næsteService: "Kontinuerlig"
      });
    }

    return items;
  }, [active.materiel]);

  // Convert GenerelState to GarrisonReadiness for BeredskabView
  const garrisonReadiness = useMemo((): GarrisonReadiness => {
    const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
    const total = sum(active.personel.officerer) + sum(active.personel.befalingsmænd) + sum(active.personel.øvrige);
    const materielAny = active.materiel as any;

    // Rough skill distribution based on personnel total
    // You can refine this if you have actual skill tracking
    const roughSkills = (tot: number): Record<string, number> => {
      return {
        DRONE_PILOT: Math.round(tot * 0.03),
        DRONE_OBS: Math.round(tot * 0.04),
        VAGT_FOERER: Math.round(tot * 0.02),
        VAGT_POST: Math.round(tot * 0.25),
        HQ_OFF: Math.round(tot * 0.05),
        SAN: Math.round(tot * 0.03),
        KONSTABEL: Math.max(0, Math.round(tot * 0.58)),
      };
    };

    // Get drones/vehicles from materiel if available
    const vehicles = active.materiel.critical?.find(c => 
      c.name.includes("Køretøj") || c.name.includes("M113")
    );
    const vehicleCount = vehicles ? vehicles.ready : 0;

    // Assume 2 drones if not specified
    const drones = 2; // Could be extracted from materiel if available

    return {
      id: active.id,
      name: active.navn,
      personnelTotal: total,
      equipment: {
        drones,
        vehicles: vehicleCount,
        mtbfHours: materielAny?.mtbfHrs ?? 150,
        slaPct: materielAny?.slaPct ?? 95,
      },
      skills: roughSkills(total),
    };
  }, [active]);

  function upd(id:string, updater:(e:GenerelState)=>GenerelState){
    if (id==="total") return;
    setState(prev=>{
      const out = prev.map(e=> e.id===id ? updater(e) : e);
      save(out); return out;
    });
  }

  /* VIEW-mode til MapView */
  const viewMode = activeId==="total" ? "country" as const : "point" as const;
  const selectedPoint = activeId==="total" ? undefined : {lat:active.lat, lng:active.lng};

  /* Luk modal = gå tilbage til overview (centrer DK) og nulstil dropdown */
  const handleClose = ()=>{
    setShowModal(false);
    setSelectedId("");
    setActiveId("total");
  };

  const handleChoose = () => {
    if (!selectedId || selectedId === "total") {
      setActiveId("total");
      setSection("alle");
      setShowModal(true);
    } else {
      setActiveId(selectedId);
      setSection("dashboard");
      setShowModal(true);
    }
  };

  const handleReset = () => {
    setSelectedId("");
    setActiveId("total");
    setSection("dashboard");
  };

  const handleSelectChange = (val: string) => {
    setSelectedId(val);
    // auto-navigate ved valg
    if (!val || val === "total") {
      setActiveId("total");
      setSection("alle");
      setShowModal(true);
    } else {
      setActiveId(val);
      setSection("dashboard");
      setShowModal(true);
    }
  };

  /* ——— UI ——— */
  
  // PlanLogView komponent
  const PlanLogView = (
    <div className="stage" style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* KORTET - fyld hele højden */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MapView
          enheder={state}
          filterReady="alle"
          viewMode={viewMode}
          selectedPoint={selectedPoint}
          onSelect={(id)=>{ setActiveId(id); setSelectedId(id); setShowModal(true); setSection("dashboard"); }}
        />
      </div>

      {/* Sidebar overlay under header (søskende til kortet, høj z-index) */}
      <div style={{ position: "absolute", left: "16px", top: "120px", zIndex: 3000, width: "360px", maxWidth: "90vw", pointerEvents: "auto" }}>
        <Sidebar
          selectedId={selectedId}
          onSelectChange={handleSelectChange}
          onChoose={handleChoose}
          onReset={handleReset}
          garrisonOptions={state.filter(e=>e.id!=="total")}
        />
      </div>

      {/* MODAL I MIDTEN - kun i planlog */}
      {showModal && active && (
        <div className="modal-backdrop" onClick={handleClose} style={{ zIndex: 4000 }}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{margin:0}}>{active.navn}</h3>
              <button className="modal-close" onClick={handleClose}>Luk ✕</button>
            </div>

            <div className="tabbar">
              {(()=>{
                const tabs = active.id === "total"
                  ? (["dashboard","alle","personel","materiel","uddannelse","andet","beredskab"] as const)
                  : (["dashboard","personel","materiel","uddannelse","andet","beredskab"] as const);
                return tabs.map(s=>
                  <button key={s} className={"tabbtn"+(section===s?" active":"")} onClick={()=>setSection(s)}>
                    {s==="dashboard"?"Dashboard":s==="alle"?"Alle kaserner":s==="personel"?"Personel":s==="materiel"?"Materiel":s==="uddannelse"?"Uddannelse":s==="beredskab"?"Beredskab":"Andet"}
                  </button>
                );
              })()}
            </div>

            {section==="dashboard" && (
              active.id === "total"
                ? (<>
                     <TotalKPI total={active}/>
                     <div style={{marginTop:"12px"}}/>
                     <KaserneGrid enheder={state} onOpen={(id)=>{ setActiveId(id); setSelectedId(id); setSection("dashboard"); }}/>
                   </>)
                : <Dashboard kpi={activeKPI} risks={activeRisks} />
            )}
            {section==="alle" && active.id==="total" && (
              <KaserneGrid
                enheder={state}
                onOpen={(id)=>{ setActiveId(id); setSelectedId(id); setSection("dashboard"); }}
              />
            )}
            {section==="personel"   && <PersonelView e={active} onChange={(u)=>upd(active.id,()=>u)} />}
            {section==="materiel"   && (
              <MaterielView
                garnisonNavn={active.navn}
                overallSLA={activeKPI.slaPct ?? 95}
                overallMTBF={activeKPI.mtbfHours ?? 150}
                items={materielItems}
              />
            )}
            {section==="uddannelse" && <UddannelseView e={active} />}
            {section==="andet"      && <AndetView e={active} />}
            {section==="beredskab"  && <BeredskabView garrison={garrisonReadiness} />}
          </div>
        </div>
      )}
    </div>
  );

  return <AppSection PlanLogView={PlanLogView} />;
}

/* ------- sections ------- */


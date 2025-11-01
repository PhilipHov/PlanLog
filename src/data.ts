import type { GenerelState, BeredskabsGruppe } from "./types";

function g(
  id:string, navn:string, lat:number, lng:number,
  mål:number,
  officerer:Partial<Record<
    "Oberst"|"Oberstløjtnant"|"Major"|"Kaptajn"|"Premierløjtnant"|"Løjtnant", number
  >>,
  befal:Partial<Record<"Senior Sergent"|"Over Sergent"|"Sergent", number>>,
  øvrige:Partial<Record<"Konstabel"|"Værnepligtig", number>>,
  våben:number, byg:number, terræn:number,
  stående:number, uddEnh:number,
  history:number[] = [52,55,57,60,62,64,66,68],
  andet:string[] = []
): GenerelState {
  return {
    id, navn, lat, lng,
    personel: {
      officerer: {
        Oberst: 0, "Oberstløjtnant": 1, Major: 2, Kaptajn: 4,
        "Premierløjtnant": 6, Løjtnant: 8, ...officerer
      },
      befalingsmænd: { "Senior Sergent": 2, "Over Sergent": 4, Sergent: 12, ...befal },
      øvrige: { Konstabel: 60, Værnepligtig: 40, ...øvrige },
      mål
    },
    materiel: { våben, bygninger: byg, terræn },
    uddannelse: { stående, uddannelsesenhed: uddEnh },
    andet,
    historyReadiness: history,
  };
}

/**
 * Helper til at tilføje extended data til en garnison baseret på størrelse
 */
function addExtendedData(base: GenerelState, scale: number = 1): GenerelState {
  const s = (n: number) => Math.round(n * scale);
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
  const totalPersonel = sum(base.personel.officerer) + sum(base.personel.befalingsmænd) + sum(base.personel.øvrige);
  
  // Personel availability - baseret på faktisk personel
  base.personelAvailability = {
    present: Math.round(totalPersonel * 0.92),
    leave: Math.max(1, s(8)),
    sick: Math.max(0, s(2)),
    training: Math.max(1, s(10))
  };

  // Planned movements
  base.plannedMovements = {
    joins: Math.max(1, s(4)),
    leaves: Math.max(1, s(2))
  };

  // Budget - baseret på størrelse
  const baseBudget = s(40000);
  base.budget = {
    used: Math.round(baseBudget * 0.95),
    cap: baseBudget + s(5000),
    weeklySpend: [s(4500), s(5200), s(5000), s(5800)],
    variance: {
      plan: baseBudget,
      supplements: s(3000),
      actual: Math.round(baseBudget * 0.95)
    }
  };

  // Capacity
  const bedsTotal = s(280) + Math.round(totalPersonel * 1.2);
  base.capacity = {
    bedsUsed: Math.round(bedsTotal * 0.82),
    bedsTotal,
    rangeDaysBooked: s(20),
    rangeDaysCapacity: 30
  };

  // Critical materiel - baseret på våben/terræn
  base.materiel.critical = [
    { name: "Rifler M/10", ready: Math.round(base.materiel.våben * 0.94), total: base.materiel.våben },
    { name: "Køretøjer M113", ready: s(28), total: s(32) },
    { name: "Radioer", ready: s(40), total: s(45) }
  ];
  base.materiel.maintenanceOpen = Math.max(1, s(4));
  base.materiel.maintenanceETAWeeks = s(3);
  
  // MTBF og SLA for materiel
  (base.materiel as any).mtbfHrs = Math.floor(60 + (scale * 60) + Math.random() * 50);
  (base.materiel as any).slaPct = Math.min(100, Math.max(85, Math.round(90 + (scale * 5) + Math.random() * 5)));

  // Materiel typer og indkvartering
  if (!base.materiel.typer) {
    base.materiel.typer = [
      { name: "Rifler", current: Math.round(base.materiel.våben * 0.94), need: base.materiel.våben },
      { name: "Køretøjer", current: s(28), need: s(32) }
    ];
  }
  if (!base.materiel.indkvartering) {
    base.materiel.indkvartering = [
      { kategori: "Officerer", senge: s(18), behov: s(20) },
      { kategori: "Befalingsmænd", senge: s(35), behov: s(40) },
      { kategori: "Øvrige", senge: Math.round(bedsTotal * 0.82), behov: Math.round(bedsTotal * 0.95) }
    ];
  }

  // Tasks
  base.tasks = [
    { 
      title: `${base.navn.split(' ')[0]} øvelse`, 
      dateISO: "2025-12-10", 
      requiredPers: Math.round(totalPersonel * 0.75), 
      requiredEquip: ["Rifler M/10", "Radioer"] 
    },
    { 
      title: "Planlagt inspektion", 
      dateISO: "2025-12-15", 
      requiredPers: s(50), 
      requiredEquip: ["Køretøjer M113"] 
    }
  ];

  // Risks - generer baseret på status
  const readiness = Math.round(100 * totalPersonel / Math.max(1, base.personel.mål));
  base.risks = [];
  if (readiness < 75) {
    base.risks.push({ name: "Personel mangel", prob: 4, impact: 5 });
  }
  if (base.materiel.maintenanceOpen && base.materiel.maintenanceOpen > 5) {
    base.risks.push({ name: "Vedligehold forsinkelse", prob: 3, impact: 3 });
  }
  if (base.budget && base.budget.used / base.budget.cap > 0.95) {
    base.risks.push({ name: "Budget overskridelse", prob: 2, impact: 4 });
  }
  if (base.risks.length === 0) {
    base.risks.push({ name: "Ingen kritiske risici", prob: 1, impact: 1 });
  }

  // Andet data - hvis ikke allerede sat
  if (Array.isArray(base.andet) || !base.andet) {
    base.andet = {
      events: Array.isArray(base.andet) ? base.andet.map(s => ({ title: s, dateISO: "" })) : [],
      moraleScore: 7 + Math.random() * 1.5
    };
  }

  // Uddannelse planer hvis ikke allerede sat
  if (!base.uddannelse.planer) {
    base.uddannelse.planer = [
      {
        unit: "stående",
        fag: [
          { navn: "Skydning M/10", progressPct: Math.min(100, Math.round(base.uddannelse.stående * 0.9)), tempoPctPrUge: 6 },
          { navn: "Føreruddannelse", progressPct: Math.min(100, Math.round(base.uddannelse.stående * 0.6)), tempoPctPrUge: 4 }
        ]
      },
      {
        unit: "værnepligt",
        fag: [
          { navn: "Basis soldat", progressPct: Math.min(100, Math.round(base.uddannelse.uddannelsesenhed * 0.85)), tempoPctPrUge: 7 },
          { navn: "Førstehjælp", progressPct: Math.min(100, Math.round(base.uddannelse.uddannelsesenhed * 1.2)), tempoPctPrUge: 10 }
        ]
      }
    ];
  }

  // Personel details hvis ikke allerede sat
  if (!base.personel.details) {
    const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
    const totalO = sum(base.personel.officerer);
    const totalB = sum(base.personel.befalingsmænd);
    const totalØ = sum(base.personel.øvrige);
    
    base.personel.details = [
      {
        unit: "stående",
        officerer: Object.fromEntries(Object.entries(base.personel.officerer).map(([k, v]) => [k, { current: v, need: Math.ceil(v * 1.1) }])),
        befalingsmænd: Object.fromEntries(Object.entries(base.personel.befalingsmænd).map(([k, v]) => [k, { current: v, need: Math.ceil(v * 1.15) }])),
        øvrige: Object.fromEntries(Object.entries(base.personel.øvrige).map(([k, v]) => [k, { current: v, need: Math.ceil(v * 1.05) }]))
      },
      {
        unit: "værnepligt",
        officerer: { Løjtnant: { current: Math.floor(totalO * 0.3), need: Math.ceil(totalO * 0.35) } },
        befalingsmænd: { Sergent: { current: Math.floor(totalB * 0.4), need: Math.ceil(totalB * 0.5) } },
        øvrige: { Værnepligtig: { current: Math.floor(totalØ * 0.4), need: Math.ceil(totalØ * 0.45) } }
      }
    ];
  }

  return base;
}

import { extendAllGarrisons } from "./data/extend";

const rawEnheder: GenerelState[] = [
  (()=>{
    const base = g("hvl","Høvelte Garnison",55.868,12.431,210,
      {Kaptajn:7,"Premierløjtnant":9,Løjtnant:12}, {"Over Sergent":6,Sergent:20},
      {Konstabel:95,Værnepligtig:60},330,5,5,70,58, [55,58,60,62,65,67,66,69], ["Garnisonsdag 25/11"]
    );
    base.personel.details = [
      {
        unit: "stående",
        officerer: { Oberst:{current:0,need:1}, Major:{current:3,need:4}, Kaptajn:{current:7,need:8} },
        befalingsmænd: { "Senior Sergent":{current:2,need:3}, "Sergent":{current:12,need:15} },
        øvrige: { Konstabel:{current:90,need:95} }
      },
      {
        unit: "værnepligt",
        officerer: { Løjtnant:{current:4,need:5} },
        befalingsmænd: { Sergent:{current:10,need:12} },
        øvrige: { Værnepligtig:{current:120,need:130} }
      }
    ];
    base.materiel.maintenanceOpen = 5;
    base.materiel.maintenanceETAWeeks = 3;
    (base.materiel as any).mtbfHrs = 142;
    (base.materiel as any).slaPct = 97;
    base.materiel.critical = [
      { name: "Rifler M/10", ready: 170, total: 180 },
      { name: "Køretøjer M113", ready: 32, total: 36 },
      { name: "Radioer", ready: 45, total: 50 }
    ];
    base.materiel.typer = [
      { name:"Rifler", current:170, need:180 },
      { name:"Køretøjer", current:32, need:36 }
    ];
    base.materiel.indkvartering = [
      { kategori:"Officerer", senge:24, behov:26 },
      { kategori:"Befalingsmænd", senge:48, behov:52 },
      { kategori:"Øvrige", senge:320, behov:340 }
    ];
    base.personelAvailability = {
      present: 195,
      leave: 8,
      sick: 2,
      training: 12
    };
    base.plannedMovements = {
      joins: 5,
      leaves: 3
    };
    base.budget = {
      used: 52300,
      cap: 55000,
      weeklySpend: [5500, 6300, 6100, 6800],
      variance: { plan: 50000, supplements: 5000, actual: 52300 }
    };
    base.capacity = {
      bedsUsed: 320,
      bedsTotal: 392,
      rangeDaysBooked: 24,
      rangeDaysCapacity: 30
    };
    base.tasks = [
      { title: "Familiesamling", dateISO: "2025-11-30", requiredPers: 180, requiredEquip: ["Rifler M/10"] },
      { title: "Øvelse på terræn", dateISO: "2025-12-05", requiredPers: 150, requiredEquip: ["Køretøjer M113", "Radioer"] }
    ];
    base.risks = [
      { name: "Personel mangel", prob: 4, impact: 5 },
      { name: "Vedligehold forsinkelse", prob: 3, impact: 3 },
      { name: "Budget overskridelse", prob: 2, impact: 4 }
    ];
    base.andet = {
      events: [{ title: "Garnisonsdag 25/11", dateISO: "2025-11-25" }],
      moraleScore: 7.9
    };
    base.uddannelse.planer = [
      { unit:"stående", fag:[
          { navn:"Skydning M/10", progressPct:72, tempoPctPrUge:6 },
          { navn:"Føreruddannelse", progressPct:40, tempoPctPrUge:4 }
        ]},
      { unit:"værnepligt", fag:[
          { navn:"Basis soldat", progressPct:55, tempoPctPrUge:7 },
          { navn:"Førstehjælp", progressPct:85, tempoPctPrUge:10 }
        ]}
    ];
    return base;
  })(),
  addExtendedData(g("ant","Antvorskov Kaserne (Slagelse)",55.404,11.354,220,
    {Major:3,Kaptajn:8,Løjtnant:10}, {"Over Sergent":6,Sergent:18},
    {Konstabel:100,Værnepligtig:55},340,6,4,68,61
  ), 1.05),
  addExtendedData(g("oks","Oksbøl Øvelsesterræn",55.622,8.284,190,
    {Kaptajn:5,"Premierløjtnant":6,Løjtnant:8}, {"Over Sergent":4,Sergent:15},
    {Konstabel:85,Værnepligtig:48},310,6,12,73,63, [60,61,63,64,66,68,70,72], ["Skydekonkurrence 30/11"]
  ), 0.95),
  addExtendedData(g("var","Varde Kaserne",55.621,8.480,180,
    {Major:2,Kaptajn:6,Løjtnant:7}, {"Over Sergent":4,Sergent:14},
    {Konstabel:80,Værnepligtig:45},300,5,4,67,60
  ), 0.9),
  addExtendedData(g("hol","Holstebro (Dragonkasernen)",56.360,8.616,200,
    {Major:3,Kaptajn:7,Løjtnant:9}, {"Over Sergent":5,Sergent:16},
    {Konstabel:90,Værnepligtig:50},320,5,5,71,64
  ), 0.98),
  addExtendedData(g("fre","Fredericia (Bülows Kaserne)",55.565,9.752,160,
    {Kaptajn:4,Løjtnant:6}, {"Over Sergent":3,Sergent:12},
    {Konstabel:70,Værnepligtig:38},220,4,2,65,58
  ), 0.7),
  addExtendedData(g("had","Haderslev Kaserne",55.255,9.492,170,
    {Kaptajn:5,Løjtnant:7}, {"Over Sergent":3,Sergent:13},
    {Konstabel:75,Værnepligtig:40},230,4,2,66,59
  ), 0.75),
  addExtendedData(g("aal","Aalborg (Nørre Uttrup)",57.048,9.918,140,
    {Kaptajn:3,"Premierløjtnant":4,Løjtnant:5}, {"Over Sergent":3,Sergent:10},
    {Konstabel:60,Værnepligtig:35},180,3,4,66,57, [48,50,51,52,54,55,57,59], ["Familiesamling 30/11"]
  ), 0.65),
  addExtendedData(g("ski","Skive Kaserne",56.565,9.027,150,
    {Kaptajn:3,Løjtnant:5}, {"Over Sergent":3,Sergent:11},
    {Konstabel:62,Værnepligtig:36},200,3,2,64,56
  ), 0.7),
  addExtendedData(g("frej","Frederikslund/Antallet (Sjælland)",55.720,12.181,130,
    {Kaptajn:2,Løjtnant:4}, {"Over Sergent":2,Sergent:9},
    {Konstabel:55,Værnepligtig:30},170,3,1,63,55
  ), 0.6),
  addExtendedData(g("nkoe","Næstved (Gardehusarregimentets støt.)",55.233,11.762,150,
    {Kaptajn:3,Løjtnant:5}, {"Over Sergent":3,Sergent:10},
    {Konstabel:65,Værnepligtig:34},190,3,2,62,54
  ), 0.68),
  addExtendedData(g("odn","Odense (HQ/Depot)",55.395,10.388,120,
    {Kaptajn:2,Løjtnant:3}, {"Over Sergent":2,Sergent:8},
    {Konstabel:50,Værnepligtig:28},150,3,1,61,53
  ), 0.55),
  addExtendedData(g("bor","Bornholm (Almegårds Kaserne)",55.116,14.708,120,
    {Kaptajn:2,Løjtnant:3}, {"Over Sergent":2,Sergent:8},
    {Konstabel:48,Værnepligtig:26},160,2,3,60,52
  ), 0.55),
];

// Udvid alle garnisoner med MTBF/SLA data
export const enheder: GenerelState[] = extendAllGarrisons(rawEnheder, 42);

export const beredskabBlokke: { title:string; grupper: BeredskabsGruppe[] }[] = [
  { title:"Til rådighed personel", grupper:[
    { title:"Kampdelinger", target:8, current:6 },
    { title:"Logistikdelinger", target:4, current:3 },
    { title:"CMD/Signal", target:3, current:2 },
  ]},
  { title:"Opgaver personel", grupper:[
    { title:"Beredskab Ø", target:4, current:3 },
    { title:"Beredskab V", target:3, current:2 },
  ]},
  { title:"Indsat personel", grupper:[
    { title:"Støtte Politiet", target:2, current:2 },
    { title:"Heimeværn støtte", target:1, current:1 },
  ]},
];

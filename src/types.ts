export type RankCounts = Record<string, number>;

export type UnitType = "stående" | "værnepligt";

export type RankBlock = {
  current: number;   // tilgængeligt
  need: number;      // behov
};

export type PersonelDetail = {
  unit: UnitType;
  officerer: Record<string, RankBlock>;      // fx Oberst, Major, ...
  befalingsmænd: Record<string, RankBlock>;  // Senior, Over, Sergent
  øvrige: Record<string, RankBlock>;         // Konstabel, Værnepligtig
};

export type Materiel = {
  bygninger: number;
  våben: number;
  terræn: number;
  maintenanceOpen?: number;
  maintenanceETAWeeks?: number;
  critical?: { name: string; ready: number; total: number; }[];
  typer?: { name: string; current: number; need: number; }[];
  indkvartering?: { kategori: string; senge: number; behov: number; }[];
};

export type Uddannelse = {
  stående: number;         // % fuldført
  uddannelsesenhed: number; // % fuldført
  planer?: {
    unit: UnitType;
    fag: { navn: string; progressPct: number; tempoPctPrUge: number; }[];
  }[];
};

export type Budget = {
  used: number;
  cap: number;
  weeklySpend?: number[];
  variance?: { plan: number; supplements: number; actual: number };
};

export type PersonelAvailability = {
  present: number;
  leave: number;
  sick: number;
  training: number;
};

export type PlannedMovements = {
  joins: number;
  leaves: number;
};

export type Capacity = {
  bedsUsed: number;
  bedsTotal: number;
  rangeDaysBooked: number;
  rangeDaysCapacity: number;
};

export type Task = {
  title: string;
  dateISO: string;
  requiredPers: number;
  requiredEquip: string[];
};

export type Risk = {
  name: string;
  prob: 1 | 2 | 3 | 4 | 5;  // 1=lav, 5=høj
  impact: 1 | 2 | 3 | 4 | 5; // 1=lav, 5=høj
};

export type AndetData = {
  events?: { title: string; dateISO: string; }[];
  moraleScore?: number;
};

export type GenerelState = {
  id: string;               // fx enheds-id / garnison
  navn: string;
  personel: {
    officerer: RankCounts;
    befalingsmænd: RankCounts;
    øvrige: RankCounts;     // konstabel, værnepligtig
    mål: number;
    details?: PersonelDetail[];
  };
  personelAvailability?: PersonelAvailability;
  plannedMovements?: PlannedMovements;
  materiel: Materiel;
  uddannelse: Uddannelse;
  andet?: string[] | AndetData;  // kan være array (legacy) eller objekt
  historyReadiness?: number[]; // historik i % (ugevis) til AI
  budget?: Budget;
  capacity?: Capacity;
  tasks?: Task[];
  risks?: Risk[];
  lat: number;
  lng: number;
};

export type BeredskabsGruppe = { title: string; target: number; current: number; };


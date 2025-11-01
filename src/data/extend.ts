import type { GenerelState } from "../types";

export type Garr = {
  id: string;
  navn: string;
  lat: number;
  lng: number;
  kpi: {
    readinessPct: number;
    personnelNow: number;
    personnelTarget: number;
    budgetUsed: number;
    budgetCap: number;
    mtbfHours?: number;
    slaPct?: number;
    anomalies?: { label: string; zscore: number }[];
  };
  risks?: { label: string; prob: 0 | 1; impact: 0 | 1 }[];
  // ... anden eksisterende struktur
};

/**
 * Udvider alle garnisoner (GenerelState) med MTBF/SLA data
 */
export function extendAllGarrisons(
  list: GenerelState[],
  seed = 42
): GenerelState[] {
  let x = seed;
  const rnd = () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;

  return list.map(g => {
    const mtbf = Math.round(100 + rnd() * 120); // 100-220t
    const sla = Math.round(95 + rnd() * 5); // 95-100%

    // Tilføj MTBF/SLA til materiel hvis ikke allerede sat
    if (!(g.materiel as any).mtbfHrs) {
      (g.materiel as any).mtbfHrs = mtbf;
    }
    if (!(g.materiel as any).slaPct) {
      (g.materiel as any).slaPct = sla;
    }

    // Opdater risks til binær format hvis de eksisterer
    if (g.risks && g.risks.length > 0) {
      g.risks = g.risks.map(r => ({
        name: r.name,
        prob: (r.prob >= 3 ? 1 : 0) as 0 | 1,
        impact: (r.impact >= 3 ? 1 : 0) as 0 | 1
      })) as any;
    }

    return g;
  });
}


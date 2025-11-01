export type KPI = {
  readinessPct: number;      // 0..100
  personnelNow: number;
  personnelTarget: number;
  budgetUsed: number;
  budgetCap: number;
  mtbfHours?: number;        // mean time between failures
  slaPct?: number;           // 0..100
  anomalies?: { label: string; zscore: number }[];
};

export function readinessColor(pct: number): "green"|"yellow"|"red" {
  if (pct >= 90) return "green";
  if (pct >= 75) return "yellow";
  return "red";
}

export function readinessGap(now: number, target: number) {
  return { gap: target - now, pct: target ? (now/target)*100 : 0 };
}

// Enkel forecast: antag lineær effekt af rekrutter/uge
export function forecastReadinessWithRecruitDelta(
  k: KPI,
  deltaRecruitsPerWeek: number,
  weeks: number
) {
  const now = k.personnelNow;
  const tgt = k.personnelTarget || 1;
  const projected = now + deltaRecruitsPerWeek * weeks;
  const pct = Math.min(100, Math.max(0, (projected / tgt) * 100));
  return { projectedPersonnel: projected, projectedPct: pct };
}

// Flag hvis z-score > 2
export function anomalyFlag(k: KPI) {
  return (k.anomalies ?? []).some(a => Math.abs(a.zscore) >= 2);
}

export function mtbfBadge(mtbf?: number, slaPct?: number) {
  const text = [
    mtbf != null ? `MTBF ${Math.round(mtbf)} t` : null,
    slaPct != null ? `SLA ${Math.round(slaPct)} %` : null
  ].filter(Boolean).join(" · ");
  let tone: "green"|"yellow"|"red" = "green";
  if ((slaPct ?? 100) < 99) tone = "yellow";
  if ((slaPct ?? 100) < 95) tone = "red";
  return { text, tone };
}

export function etaToTargetWeeks(current: number, goal: number, recruitsPerWeek: number) {
  if (recruitsPerWeek <= 0) return Infinity;
  const deficit = Math.max(0, goal - current);
  return Math.ceil(deficit / recruitsPerWeek);
}

// Legacy functions for backward compatibility
export function zscore(series: number[]) {
  if (!series || series.length < 3) return series.map(() => 0);
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const sd = Math.sqrt(series.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / series.length) || 1;
  return series.map(v => (v - mean) / sd);
}

export function anomalyIndices(series: number[], thr = 2) {
  return zscore(series).map((z, i) => Math.abs(z) > thr ? i : -1).filter(i => i >= 0);
}


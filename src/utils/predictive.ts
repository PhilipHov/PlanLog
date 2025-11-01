import type { GenerelState } from "../types";
import { readinessForecast } from "../ai";

/**
 * Predictive utilities for Hæren Logistik
 * - Readiness forecast (30 dage)
 * - Budget forecast (uger til cap)
 * - Certificering ETA og flaskehals
 * - Rekrutteringsforslag (top 3 gaps)
 */

/**
 * Readiness forecast for 30 dage (4 uger)
 */
export function readinessForecast30Days(history: number[]): number[] {
  if (!history.length) return new Array(30).fill(0);
  
  // Brug eksisterende readinessForecast fra ai.ts
  return readinessForecast(history, 4).map((v: number) => Math.round(v));
}

/**
 * Budget forecast - beregn uger til cap
 */
export function budgetWeeksToCap(budget?: { used: number; cap: number; weeklySpend?: number[] }): number | null {
  if (!budget || !budget.weeklySpend || budget.weeklySpend.length === 0) return null;
  
  const avgWeeklySpend = budget.weeklySpend.reduce((a, b) => a + b, 0) / budget.weeklySpend.length;
  if (avgWeeklySpend <= 0) return null;
  
  const remaining = budget.cap - budget.used;
  return Math.ceil(remaining / avgWeeklySpend);
}

/**
 * Certificering ETA og flaskehals
 */
export function certificationETA(plan?: { fag: { navn: string; progressPct: number; tempoPctPrUge: number; }[] }): {
  slowest: { navn: string; weeks: number } | null;
  all: { navn: string; progressPct: number; weeks: number }[];
} {
  if (!plan || !plan.fag || plan.fag.length === 0) {
    return { slowest: null, all: [] };
  }

  const all = plan.fag.map(f => {
    const remain = Math.max(0, 100 - f.progressPct);
    const weeks = f.tempoPctPrUge > 0 ? Math.ceil(remain / f.tempoPctPrUge) : Infinity;
    return { navn: f.navn, progressPct: f.progressPct, weeks };
  });

  const slowest = all.reduce((prev, curr) => 
    (curr.weeks > prev.weeks || (curr.weeks === prev.weeks && curr.progressPct < prev.progressPct)) ? curr : prev
  , all[0] || { navn: "", weeks: 0, progressPct: 0 });

  return { 
    slowest: all.length > 0 ? { navn: slowest.navn, weeks: slowest.weeks } : null,
    all 
  };
}

/**
 * Rekrutteringsforslag - top 3 gaps (alias for backward compatibility)
 */
export function suggestHiring(e: GenerelState): { name: string; gap: number; current: number; need: number; }[] {
  const gaps: { name: string; gap: number; current: number; need: number }[] = [];

  // Check personel details for gaps
  if (e.personel.details) {
    e.personel.details.forEach(detail => {
      Object.entries(detail.officerer).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            name: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
      Object.entries(detail.befalingsmænd).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            name: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
      Object.entries(detail.øvrige).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            name: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
    });
  }

  // Sort by gap size and return top 3
  return gaps
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);
}

/**
 * Rekrutteringsforslag - top 3 gaps
 */
export function recruitmentSuggestions(e: GenerelState): { rank: string; gap: number; pct: number; }[] {
  const gaps: { rank: string; gap: number; current: number; need: number }[] = [];

  // Check personel details for gaps
  if (e.personel.details) {
    e.personel.details.forEach(detail => {
      Object.entries(detail.officerer).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            rank: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
      Object.entries(detail.befalingsmænd).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            rank: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
      Object.entries(detail.øvrige).forEach(([rank, block]) => {
        if (block.need > block.current) {
          gaps.push({
            rank: `${rank} (${detail.unit})`,
            gap: block.need - block.current,
            current: block.current,
            need: block.need
          });
        }
      });
    });
  }

  // Sort by gap size and return top 3
  return gaps
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map(g => ({
      rank: g.rank,
      gap: g.gap,
      pct: Math.round((g.current / g.need) * 100)
    }));
}

/**
 * Forecast tilgængelighed om 30 dage
 */
export function forecastAvailable(e: GenerelState): number {
  const present = e.personelAvailability?.present ?? 0;
  const joins = e.plannedMovements?.joins ?? 0;
  const leaves = e.plannedMovements?.leaves ?? 0;
  const away = (e.personelAvailability?.leave ?? 0);
  const need = e.personel.mål;
  const in30 = present + joins - leaves - away;
  return Math.max(0, Math.min(100, Math.round((in30 / Math.max(1, need)) * 100)));
}

/**
 * Forecast certificering - ETA og bottleneck
 */
export function forecastCertification(e: GenerelState, unit: "stående" | "værnepligt"): {
  etaWeeks: number;
  bottleneck: string | null;
} {
  const plan = e.uddannelse.planer?.find(p => p.unit === unit);
  if (!plan || !plan.fag || plan.fag.length === 0) {
    return { etaWeeks: Infinity, bottleneck: null };
  }

  const etas = plan.fag.map(f => {
    const remain = Math.max(0, 100 - f.progressPct);
    const weeks = f.tempoPctPrUge > 0 ? Math.ceil(remain / f.tempoPctPrUge) : Infinity;
    return { navn: f.navn, weeks };
  });

  const slowest = etas.reduce((prev, curr) => 
    (curr.weeks > prev.weeks || (curr.weeks === prev.weeks && prev.weeks === Infinity)) ? curr : prev
  , etas[0] || { navn: "", weeks: Infinity });

  return {
    etaWeeks: slowest.weeks,
    bottleneck: slowest.weeks !== Infinity ? slowest.navn : null
  };
}

/**
 * Helper til at formatere ETA
 */
export function etaStr(weeks: number): string {
  return Number.isFinite(weeks) ? `${weeks} uger` : 'ukendt';
}

/**
 * Forecast readiness - returner nu og 30 dage
 */
export function forecastReadiness(e: GenerelState): { now: number; in30: number } {
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
  const total = sum(e.personel.officerer) + sum(e.personel.befalingsmænd) + sum(e.personel.øvrige);
  const now = Math.round(100 * total / Math.max(1, e.personel.mål));
  const in30 = forecastAvailable(e);
  return { now, in30 };
}


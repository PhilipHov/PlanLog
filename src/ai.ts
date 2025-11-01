/**
 * Simpelt AI-modul:
 * - Glidende gennemsnit (window=3)
 * - Lineær regression (OLS) på de seneste punkter
 * - Kombinerer (0.4 * MA + 0.6 * LR) til forecast
 * - Clamper 0..100
 */

export function movingAverage(series: number[], window = 3): number[] {
  const out: number[] = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    out.push(slice.reduce((a,b)=>a+b,0) / slice.length);
  }
  return out;
}

export function linearRegressionForecast(series: number[], horizon = 4): number[] {
  const n = series.length;
  if (n < 2) return new Array(horizon).fill(series[n-1] ?? 0);

  // x = 0..n-1
  const x = Array.from({length:n}, (_,i)=>i);
  const y = series;

  const mean = (arr:number[]) => arr.reduce((a,b)=>a+b,0)/arr.length;
  const xm = mean(x), ym = mean(y);
  let num=0, den=0;
  for (let i=0;i<n;i++){ num += (x[i]-xm)*(y[i]-ym); den += (x[i]-xm)*(x[i]-xm); }
  const b = den === 0 ? 0 : num/den; // slope
  const a = ym - b*xm;               // intercept

  const out:number[] = [];
  for (let h=1; h<=horizon; h++){
    const xi = n-1 + h;
    out.push(a + b*xi);
  }
  return out;
}

export function clamp01pct(v:number){ return Math.max(0, Math.min(100, v)); }

/** Kombineret forecast */
export function readinessForecast(history: number[], horizon=4): number[] {
  if (!history.length) return new Array(horizon).fill(0);
  const maSeries = movingAverage(history);
  const maBase = maSeries[maSeries.length-1] ?? history[history.length-1];
  const lr = linearRegressionForecast(history, horizon);
  const out = lr.map((v)=> clamp01pct(0.6*v + 0.4*maBase));
  return out;
}

/** Simuler "mangel → indsats" forbedring (what-if) */
export function simulateBoost(base:number[], boostPct=5, weeks=4){
  return base.map((v,i)=> clamp01pct(v + (i < weeks ? boostPct : 0)));
}


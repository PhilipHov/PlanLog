import { useMemo, useState } from "react";
import { forecastReadinessWithRecruitDelta } from "../../utils/analytics";
import type { KPI } from "../../utils/analytics";

type Props = {
  // Nuværende status
  currentPersonnel: number; // fx 209
  goalPersonnel: number;    // fx 220

  // Defaults / antagelser
  defaultRecruitsPerWeek?: number; // startværdi for slider
  defaultWeeks?: number;           // startværdi for slider
  maxRecruitsPerWeek?: number;     // slider max
  maxWeeks?: number;               // slider max

  // (valgfri) økonomi
  costPerRecruit?: number;         // kr. pr. rekrut, fx 18500
  currency?: string;               // fx "kr"
};

function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "12px"
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: 600 }}>{value}</div>
      {hint && <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>{hint}</div>}
    </div>
  );
}

export default function WhatIfPanel({
  currentPersonnel,
  goalPersonnel,
  defaultRecruitsPerWeek = 4,
  defaultWeeks = 5,
  maxRecruitsPerWeek = 20,
  maxWeeks = 26,
  costPerRecruit = 0,
  currency = "kr",
}: Props) {
  const [rPerWeek, setRPerWeek] = useState(defaultRecruitsPerWeek);
  const [weeks, setWeeks] = useState(defaultWeeks);

  const baselinePct = useMemo(() => {
    return Math.round((currentPersonnel / goalPersonnel) * 100);
  }, [currentPersonnel, goalPersonnel]);

  // Create a temporary KPI for forecast function
  const tempKPI: KPI = useMemo(() => ({
    readinessPct: baselinePct,
    personnelNow: currentPersonnel,
    personnelTarget: goalPersonnel,
    budgetUsed: 0,
    budgetCap: 0
  }), [baselinePct, currentPersonnel, goalPersonnel]);

  const forecastResult = useMemo(() => {
    return forecastReadinessWithRecruitDelta(tempKPI, rPerWeek, weeks);
  }, [tempKPI, rPerWeek, weeks]);

  const forecastPct = Math.round(forecastResult.projectedPct);
  const forecastCount = Math.round(forecastResult.projectedPersonnel);
  const added = rPerWeek * weeks;
  const deltaPct = forecastPct - baselinePct;
  const deficit = Math.max(0, goalPersonnel - currentPersonnel);
  // Estimer simpel ETA (uger) for at ramme 100% ved nuværende r/uge
  const etaWeeks = rPerWeek > 0 ? Math.ceil(deficit / rPerWeek) : Infinity;
  const totalCost = costPerRecruit > 0 ? added * costPerRecruit : 0;

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "20px"
      }}
    >
      <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "12px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>What-if (rekrutter)</h3>
        <span
          style={{
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            padding: "4px 8px",
            fontSize: "14px"
          }}
        >
          Baseline: <strong>{baselinePct}%</strong> ({currentPersonnel} / {goalPersonnel})
        </span>
        <span
          style={{
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            padding: "4px 8px",
            fontSize: "14px"
          }}
        >
          Prognose: <strong style={{ color: forecastPct >= 100 ? "#34d399" : "#93c5fd" }}>
            {Math.round(forecastPct)}%
          </strong>{" "}
          ({Math.round(forecastCount)} / {goalPersonnel})
        </span>
        <span
          style={{
            borderRadius: "8px",
            background: "rgba(255,255,255,0.1)",
            padding: "4px 8px",
            fontSize: "14px"
          }}
        >
          Δ: <strong style={{ color: deltaPct >= 0 ? "#34d399" : "#f87171" }}>
            {deltaPct >= 0 ? "+" : ""}
            {deltaPct} pp
          </strong>
        </span>
      </div>

      {/* Kontroller i to pæne rækker */}
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        <div
          style={{
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            padding: "16px"
          }}
        >
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "14px", opacity: 0.8 }}>+ rekrutter / uge</label>
            <span style={{ fontWeight: 500 }}>{rPerWeek}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxRecruitsPerWeek}
            step={1}
            value={rPerWeek}
            onChange={(e) => setRPerWeek(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {/* Presets */}
            {[2, 4, 8, 12].map((n) => (
              <button
                key={n}
                onClick={() => setRPerWeek(n)}
                style={{
                  borderRadius: "8px",
                  padding: "4px 8px",
                  fontSize: "14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: rPerWeek === n ? "rgba(255,255,255,0.1)" : "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => { if (rPerWeek !== n) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (rPerWeek !== n) e.currentTarget.style.background = "transparent"; }}
              >
                {n}/uge
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            padding: "16px"
          }}
        >
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "14px", opacity: 0.8 }}>Horisont (uger)</label>
            <span style={{ fontWeight: 500 }}>{weeks}</span>
          </div>
          <input
            type="range"
            min={1}
            max={maxWeeks}
            step={1}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[4, 8, 12, 26].map((n) => (
              <button
                key={n}
                onClick={() => setWeeks(n)}
                style={{
                  borderRadius: "8px",
                  padding: "4px 8px",
                  fontSize: "14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: weeks === n ? "rgba(255,255,255,0.1)" : "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => { if (weeks !== n) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (weeks !== n) e.currentTarget.style.background = "transparent"; }}
              >
                {n} uger
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI-bjælke */}
      <div style={{ marginTop: "20px", display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <Kpi label="Tilføjes (antal)" value={added.toLocaleString("da-DK")} />
        <Kpi
          label="Tid til 100%"
          value={rPerWeek === 0 ? "∞" : `${Math.max(0, etaWeeks)} uger`}
          hint="Ved nuværende rekrutteringstempo"
        />
        <Kpi label="Manko nu" value={deficit.toLocaleString("da-DK")} />
        <Kpi
          label="Est. omkostning"
          value={totalCost > 0 ? `${totalCost.toLocaleString("da-DK")} ${currency}` : "—"}
          hint={costPerRecruit > 0 ? `à ${costPerRecruit.toLocaleString("da-DK")} ${currency}` : undefined}
        />
      </div>

      <p style={{ marginTop: "16px", fontSize: "12px", opacity: 0.6 }}>
        Prognosen er simpel og antager lineær tilgang uden frafald. Finjustér ved at kombinere med uddannelses-prognoser.
      </p>
    </div>
  );
}

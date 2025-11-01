import type { KPI } from "../../utils/analytics";
import { readinessGap, readinessColor } from "../../utils/analytics";

export default function CriticalGapsCard({ kpi, onlyCritical = false }: { kpi: KPI; onlyCritical?: boolean }) {
  const g = readinessGap(kpi.personnelNow, kpi.personnelTarget);
  const color = readinessColor(g.pct);
  if (onlyCritical && color === "green") return null;

  const tone = color === "green" ? "#34d399"
    : color === "yellow" ? "#fbbf24"
    : "#f87171";

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(148,163,184,0.3)",
        background: "rgba(15,23,42,0.6)",
        padding: "16px"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ color: "#f1f5f9", fontWeight: 600 }}>Kritisk gap</div>
        <div style={{ fontSize: "18px", color: tone }}>{Math.round(g.pct)}%</div>
      </div>
      <div style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px" }}>
        Personel: {kpi.personnelNow} / {kpi.personnelTarget} ({g.gap >= 0 ? "mangler" : "over"} {Math.abs(g.gap)})
      </div>
    </div>
  );
}


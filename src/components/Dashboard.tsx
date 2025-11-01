import { useState } from "react";
import type { KPI } from "../utils/analytics";
import { anomalyFlag, readinessColor } from "../utils/analytics";
import WhatIfPanel from "./widgets/WhatIfControl";
import CriticalGapsCard from "./widgets/CriticalGapsCard";
import RiskMatrix from "./widgets/RiskMatrix2x2";
import BudgetWaterfall from "./widgets/BudgetWaterfall";
import ExportPdfButton from "./ExportPdfButton";

export default function Dashboard({ kpi, risks }: { kpi: KPI; risks: { label: string; prob: 0 | 1; impact: 0 | 1 }[] }) {
  const [criticalOnly, setCriticalOnly] = useState(false);
  const flagged = anomalyFlag(kpi);
  const tone = readinessColor(kpi.readinessPct);

  const headerTone = tone === "green" ? "#34d399"
    : tone === "yellow" ? "#fbbf24"
    : "#f87171";

  return (
    <div id="dashboard-root" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 600, color: headerTone }}>
          Readiness {Math.round(kpi.readinessPct)}%
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#e5e7eb", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={criticalOnly}
              onChange={e => setCriticalOnly(e.target.checked)}
              style={{ accentColor: "#60a5fa" }}
            />
            Kritiske kun
          </label>
          <ExportPdfButton targetId="dashboard-root" />
        </div>
      </div>

      {flagged && (
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(245,158,11,0.4)",
            background: "rgba(245,158,11,0.1)",
            color: "#fcd34d",
            padding: "12px"
          }}
        >
          Anomali detekteret i uddannelsesprogression – tjek "Uddannelse".
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <CriticalGapsCard kpi={kpi} onlyCritical={criticalOnly} />
        <BudgetWaterfall kpi={kpi} />
        <WhatIfPanel
          currentPersonnel={kpi.personnelNow}
          goalPersonnel={kpi.personnelTarget}
          defaultRecruitsPerWeek={4}
          defaultWeeks={5}
          costPerRecruit={18500}
        />
        <RiskMatrix items={risks} />
      </div>
    </div>
  );
}

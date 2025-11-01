import type { KPI } from "../../utils/analytics";

export default function BudgetWaterfall({ kpi }: { kpi: KPI }) {
  const pct = Math.min(100, Math.max(0, (kpi.budgetUsed / (kpi.budgetCap || 1)) * 100));
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(148,163,184,0.3)",
        background: "rgba(15,23,42,0.6)",
        padding: "16px"
      }}
    >
      <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "8px" }}>Budget</div>
      <div style={{ color: "#cbd5e1", fontSize: "14px", marginBottom: "8px" }}>
        {Intl.NumberFormat("da-DK").format(kpi.budgetUsed)} / {Intl.NumberFormat("da-DK").format(kpi.budgetCap)} kr
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          borderRadius: "4px",
          background: "rgba(148,163,184,0.3)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "8px",
            background: "#60a5fa",
            width: `${pct}%`
          }}
        />
      </div>
    </div>
  );
}


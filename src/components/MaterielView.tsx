import { mtbfBadge } from "../utils/analytics";

type MaterielItem = {
  kategori: string;       // fx "Køretøjer"
  operativ: number;       // operativt antal
  total: number;          // totalt antal
  slaPct: number;         // faktisk SLA for kategorien
  mtbfHours: number;      // MTBF i timer
  næsteService?: string;  // dato eller uge
  issues?: string[];      // korte noter
};

type Props = {
  garnisonNavn: string;
  overallSLA: number;     // samlet SLA
  overallMTBF: number;    // samlet MTBF
  items: MaterielItem[];  // breakdown pr. kategori
};

function ActionChip({ label }: { label: string }) {
  return (
    <button
      style={{
        borderRadius: "8px",
        background: "rgba(255,255,255,0.05)",
        padding: "4px 12px",
        fontSize: "14px",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e5e7eb",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
    >
      {label}
    </button>
  );
}

export default function MaterielView({
  garnisonNavn,
  overallSLA,
  overallMTBF,
  items,
}: Props) {
  const badge = mtbfBadge(overallMTBF, overallSLA);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Overblikskort */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)",
          padding: "20px"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
            Materiel{garnisonNavn ? ` – ${garnisonNavn}` : ""}
          </h3>
          <span
            style={{
              borderRadius: "8px",
              padding: "4px 12px",
              fontSize: "14px",
              border: `1px solid ${
                badge.tone === "green" ? "rgba(34,197,94,0.3)" :
                badge.tone === "yellow" ? "rgba(245,158,11,0.3)" :
                "rgba(239,68,68,0.3)"
              }`,
              background: badge.tone === "green" ? "rgba(34,197,94,0.1)" :
                         badge.tone === "yellow" ? "rgba(245,158,11,0.1)" :
                         "rgba(239,68,68,0.1)",
              color: badge.tone === "green" ? "#6ee7b7" :
                     badge.tone === "yellow" ? "#fcd34d" :
                     "#fca5a5"
            }}
          >
            {badge.text}
          </span>
        </div>
      </div>

      {/* Tabel pr. kategori */}
      <div style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)" }}>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>Kategori</th>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>SLA</th>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>MTBF</th>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>Næste service</th>
              <th style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600 }}>Noter</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const pct = Math.round((it.operativ / it.total) * 100);
              const borderStyle = idx < items.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.1)" } : {};
              return (
                <tr key={it.kategori} style={{ fontSize: "14px", ...borderStyle }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{it.kategori}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          height: "10px",
                          width: "96px",
                          overflow: "hidden",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.1)"
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct >= 95 ? "#34d399" :
                                       pct >= 85 ? "#fbbf24" :
                                       "#f87171"
                          }}
                        />
                      </div>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        {it.operativ} / {it.total} ({pct}%)
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{it.slaPct}%</td>
                  <td style={{ padding: "12px 16px" }}>{Math.round(it.mtbfHours)} t</td>
                  <td style={{ padding: "12px 16px" }}>{it.næsteService ?? "—"}</td>
                  <td style={{ padding: "12px 16px", opacity: 0.8 }}>
                    {it.issues && it.issues.length > 0 ? it.issues.join(" • ") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hurtige "action-chips" */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <ActionChip label="Vis kun under 90% SLA" />
        <ActionChip label="Nær service (<14 dage)" />
        <ActionChip label="Eksportér som PDF" />
      </div>
    </div>
  );
}

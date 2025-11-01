export type TabKey = "planlog" | "plantn" | "plantid";

const TABS: Record<TabKey, { label: string; hash: string }> = {
  planlog: { label: "PlanLog", hash: "#planlog" },
  plantn: { label: "PlanTN", hash: "#plantn" },
  plantid: { label: "PlanTid", hash: "#plantid" },
};

export default function GlassHud({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.7)", // hvid baggrund, men tydelig
        border: "1px solid rgba(255,255,255,0.6)",
        backdropFilter: "blur(24px)",
        padding: "12px 16px",
        boxShadow: "0 10px 35px -10px rgba(0,0,0,0.35)",
      }}
    >
      {/* HÆREN — altid tydelig */}
      <span style={{ paddingLeft: "4px", paddingRight: "8px", fontSize: "20px", fontWeight: 800, letterSpacing: "0.05em", color: "#ffffff", textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)" }}>
        HÆREN
      </span>

      {/* slank divider som i skabelonen */}
      <span style={{ marginLeft: "4px", marginRight: "4px", height: "24px", width: "1px", background: "rgba(255,255,255,0.65)" }} />

      {/* fane-gruppe: alle synlige, aktiv mest tydelig */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.5)", // hvid baggrund
          padding: "4px",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {(Object.keys(TABS) as TabKey[]).map((k) => {
          const on = active === k;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(k)}
              style={{
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.15s ease",
                border: "1px solid",
                cursor: "pointer",
                outline: "none",
                ...(on
                  ? {
                      background: "rgba(99,102,241,1)", // bg-indigo-500
                      color: "#ffffff",
                      borderColor: "rgba(129,140,248,1)", // border-indigo-400
                      boxShadow: "0 2px 4px 0 rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.6)",
                      textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)",
                    }
                  : {
                      background: "rgba(255,255,255,0.4)", // hvid baggrund
                      color: "#ffffff", // fuld hvid tekst
                      borderColor: "rgba(255,255,255,0.6)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.4)",
                      textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)",
                    }),
              }}
              onMouseEnter={(e) => {
                if (!on) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!on) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.4)";
                }
              }}
            >
              {TABS[k].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


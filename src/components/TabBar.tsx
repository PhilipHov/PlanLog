export type AppTab = "planlog" | "plantn" | "plantid";

type TabKey = AppTab;

const TABS: { key: TabKey; label: string; hash: string }[] = [
  { key: "planlog", label: "PlanLog", hash: "#planlog" },
  { key: "plantn",  label: "PlanTN",  hash: "#plantn"  },
  { key: "plantid", label: "PlanTid", hash: "#plantid" },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
};

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav
      style={{
        margin: "8px auto 12px",
        width: "fit-content",
        borderRadius: "22px",
        background: "rgba(255,255,255,0.06)",
        padding: "4px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
      }}
      aria-label="Primære visninger"
    >
      <ul style={{ display: "flex", gap: "4px", margin: 0, padding: 0, listStyle: "none" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <li key={t.key}>
              <button
                onClick={() => {
                  window.location.hash = t.hash;
                  onChange(t.key);
                }}
                style={{
                  borderRadius: "18px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.025em",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.15s",
                  cursor: "pointer",
                  outline: "none",
                  ...(isActive
                    ? {
                        background: "rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                      }
                    : {
                        background: "rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.85)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.4)";
                }}
                onBlur={(e) => {
                  if (isActive) {
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.25)";
                  } else {
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.18)";
                  }
                }}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

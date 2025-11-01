type Tab = { id: string; label: string };

type Props = {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTab: (id: string) => void;
  onRefresh: () => void;
  onOpenExternal: () => void;
};

export default function ModuleHeader({
  title,
  tabs,
  activeTab,
  onTab,
  onRefresh,
  onOpenExternal,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px 8px",
        background: "rgba(24,24,27,0.7)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "14px",
            letterSpacing: "0.05em",
            color: "#d1d5db",
          }}
        >
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                border: "1px solid",
                transition: "all 0.2s",
                cursor: "pointer",
                ...(activeTab === t.id
                  ? {
                      background: "rgba(39,39,42,1)",
                      color: "#f3f4f6",
                      borderColor: "rgba(82,82,91,1)",
                    }
                  : {
                      background: "rgba(39,39,42,0.4)",
                      color: "#d1d5db",
                      borderColor: "rgba(63,63,70,1)",
                    }),
              }}
              onMouseEnter={(e) => {
                if (activeTab !== t.id) {
                  e.currentTarget.style.background = "rgba(39,39,42,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== t.id) {
                  e.currentTarget.style.background = "rgba(39,39,42,0.4)";
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={onRefresh}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            background: "rgba(39,39,42,0.6)",
            border: "1px solid rgba(82,82,91,1)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(39,39,42,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(39,39,42,0.6)";
          }}
          title="Opdatér"
        >
          Opdatér
        </button>
        <button
          onClick={onOpenExternal}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            background: "rgba(39,39,42,0.6)",
            border: "1px solid rgba(82,82,91,1)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(39,39,42,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(39,39,42,0.6)";
          }}
          title="Åbn i ny fane"
        >
          Åbn i ny fane ↗
        </button>
      </div>
    </div>
  );
}


export default function SidebarFavorites({
  items,
  onOpen
}: {
  items: { id: string; navn: string }[];
  onOpen: (id: string) => void;
}) {
  if (!items?.length) return null;

  return (
    <div style={{
      marginTop: "16px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.05)",
      padding: "12px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span>⭐</span>
        <span style={{ fontWeight: 600 }}>Favoritter</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(i => (
          <button
            key={i.id}
            onClick={() => onOpen(i.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e5e7eb",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            {i.navn}
          </button>
        ))}
      </div>
    </div>
  );
}


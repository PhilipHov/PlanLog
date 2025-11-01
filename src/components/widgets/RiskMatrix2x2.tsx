export default function RiskMatrix({ items }: { items: { label: string; prob: 0 | 1; impact: 0 | 1 }[] }) {
  // 2x2 simpelt grid
  const cell = (p: 0 | 1, i: 0 | 1) => items.filter(x => x.prob === p && x.impact === i);
  const Box = ({ list }: { list: { label: string }[] }) => (
    <div
      style={{
        minHeight: "72px",
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.3)",
        background: "rgba(15,23,42,0.4)",
        padding: "8px",
        color: "#e5e7eb",
        fontSize: "14px"
      }}
    >
      {list.length === 0 ? (
        <div style={{ opacity: 0.6 }}>—</div>
      ) : (
        <ul style={{ listStyle: "disc", marginLeft: "16px", padding: 0 }}>
          {list.map((x, i) => (
            <li key={i}>{x.label}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(148,163,184,0.3)",
        background: "rgba(15,23,42,0.6)",
        padding: "16px"
      }}
    >
      <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: "8px" }}>Risiko (2×2)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <Box list={cell(0, 0)} />
        <Box list={cell(1, 0)} />
        <Box list={cell(0, 1)} />
        <Box list={cell(1, 1)} />
      </div>
    </div>
  );
}


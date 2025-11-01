export default function CapacityDonutETA({
  value,
  label,
  eta
}: {
  value: number;
  label: string;
  eta?: string;
}) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const off = c * (1 - pct / 100);

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      }}
    >
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="#8ab4ff"
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={off}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle" fontSize="18" fill="#e5e7eb">
          {pct}%
        </text>
      </svg>
      <div>
        <div style={{ color: "#e5e7eb", fontWeight: 600 }}>{label}</div>
        {eta && <div style={{ color: "#94a3b8", fontSize: "14px" }}>ETA: {eta}</div>}
      </div>
    </div>
  );
}


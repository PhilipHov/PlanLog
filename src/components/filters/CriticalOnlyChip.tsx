export default function CriticalOnlyChip({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: "6px 12px",
        borderRadius: "9999px",
        border: `1px solid ${active ? "#f87171" : "rgba(255,255,255,0.1)"}`,
        fontSize: "14px",
        background: active ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.05)",
        color: active ? "#fca5a5" : "#cbd5e1",
        cursor: "pointer"
      }}
    >
      Kritiske kun
    </button>
  );
}


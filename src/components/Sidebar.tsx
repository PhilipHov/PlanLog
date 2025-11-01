import GlassPanel from "./GlassPanel";

type Props = {
  selectedId: string;
  onSelectChange: (val: string) => void;
  onChoose: () => void;
  onReset: () => void;
  garrisonOptions: Array<{ id: string; navn: string }>;
};

export default function Sidebar({
  selectedId,
  onSelectChange,
  onChoose,
  onReset,
  garrisonOptions,
}: Props) {
  return (
    <GlassPanel title="Vælg garnison">
      <select
        value={selectedId}
        onChange={(e) => onSelectChange(e.target.value)}
        style={{
          marginBottom: "12px",
          width: "100%",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.5)", // tydeligere border
          background: "rgba(255,255,255,0.45)", // mere tydelig baggrund
          padding: "12px 16px",
          fontSize: "16px",
          color: "#ffffff", // text-white
          textShadow: "0 3px 8px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)",
          fontWeight: 600,
          outline: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; // focus:border-white/70
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; // border-white/50
        }}
      >
        <option value="" disabled>Vælg</option>
        <option value="total">TOTAL – Hæren</option>
        {garrisonOptions.map((e) => (
          <option key={e.id} value={e.id}>
            {e.navn}
          </option>
        ))}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <button
          onClick={onChoose}
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.5)", // tydeligere border
            background: "rgba(255,255,255,0.45)", // mere tydelig baggrund
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff", // text-white
            textShadow: "0 3px 8px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.45)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; // focus:border-white/70
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; // border-white/50
          }}
        >
          Vælg
        </button>
        <button
          onClick={onReset}
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.5)", // tydeligere border
            background: "rgba(255,255,255,0.45)", // mere tydelig baggrund
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#ffffff", // text-white
            textShadow: "0 3px 8px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.45)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; // focus:border-white/70
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; // border-white/50
          }}
        >
          Reset udsyn
        </button>
      </div>
    </GlassPanel>
  );
}

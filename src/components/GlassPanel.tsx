type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function GlassPanel({ title, children }: Props) {
  return (
    <div
      style={{
        borderRadius: "22px",
        background: "rgba(255,255,255,0.6)", // mere tydelig baggrund
        padding: "12px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        border: "1px solid rgba(255,255,255,0.5)", // tydeligere border
        backdropFilter: "blur(16px)", // backdrop-blur-lg
      }}
    >
      {title && (
        <div
          style={{
            marginBottom: "12px",
            fontSize: "14px",
            color: "#ffffff", // text-white
            textShadow: "0 3px 8px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}


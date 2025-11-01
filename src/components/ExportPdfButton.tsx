export default function ExportPdfButton({ targetId: _targetId }: { targetId?: string }) {
  const onExport = async () => {
    // Minimal client-print. (Ægte PDF kan laves med html2canvas/jsPDF hvis du ønsker)
    window.print();
  };

  return (
    <button
      onClick={onExport}
      style={{
        padding: "6px 12px",
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.3)",
        color: "#f1f5f9",
        cursor: "pointer",
        background: "rgba(15,23,42,0.6)"
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.8)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15,23,42,0.6)"; }}
    >
      Eksportér dashboard (PDF)
    </button>
  );
}


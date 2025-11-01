import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  title: string;
};

export default function EmbeddedApp({ url, title }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    // hvis indlæsn. tager > 12s, vis fallback
    timerRef.current = window.setTimeout(() => setFailed(true), 12000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [url]);

  return (
    <div style={{ width: "100%", height: "100%", animation: "fadein 0.15s ease-in" }}>
      {!loaded && !failed && (
        <div
          style={{
            margin: "24px auto",
            width: "min(960px, 96%)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
          }}
          role="status"
          aria-live="polite"
        >
          Indlæser <span style={{ fontWeight: 500 }}>{title}</span> …
          <div
            style={{
              marginTop: "12px",
              height: "4px",
              width: "100%",
              overflow: "hidden",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "33%",
                background: "rgba(255,255,255,0.6)",
                animation: "load 1.4s ease infinite",
              }}
            />
          </div>
        </div>
      )}

      {failed && (
        <div
          style={{
            margin: "24px auto",
            width: "min(960px, 96%)",
            borderRadius: "16px",
            border: "1px solid rgba(248,113,113,0.2)",
            background: "rgba(248,113,113,0.1)",
            padding: "20px",
            color: "#fecaca",
          }}
        >
          Kunne ikke indlæse <span style={{ fontWeight: 600 }}>{title}</span>.
          <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                padding: "8px 12px",
                color: "#ffffff",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              Åbn i ny fane
            </a>
            <button
              onClick={() => {
                setFailed(false);
                setLoaded(false);
              }}
              style={{
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                padding: "8px 12px",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              Prøv igen
            </button>
          </div>
        </div>
      )}

      <iframe
        title={title}
        src={url}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        loading="eager"
        referrerPolicy="no-referrer"
        allow="fullscreen"
        onLoad={() => {
          setLoaded(true);
          if (timerRef.current) window.clearTimeout(timerRef.current);
        }}
      />

      <style>{`
        @keyframes load {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}


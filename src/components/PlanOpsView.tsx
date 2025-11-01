import { useState, useEffect, useRef } from "react";
import ModuleHeader from "./ModuleHeader";

type Tab = { id: string; label: string };

type Props = {
  title: string;
  url: string;
  tabs: Tab[];
};

export default function PlanOpsView({ title, url, tabs }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "tab1");
  const [src, setSrc] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If you later want tabs to change the iframe URL, tweak this map:
  useEffect(() => {
    // Example: keep same url but add hash for visual state
    const u = new URL(src);
    u.hash = `#${activeTab}`;
    setSrc(u.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const refresh = () => {
    if (iframeRef.current?.contentWindow) {
      // full reload for cross-origin iframes -> just poke src
      setSrc((s) => {
        const u = new URL(s);
        u.searchParams.set("_ts", Date.now().toString());
        return u.toString();
      });
    }
  };

  const openExternal = () => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <ModuleHeader
        title={title}
        tabs={tabs}
        activeTab={activeTab}
        onTab={setActiveTab}
        onRefresh={refresh}
        onOpenExternal={openExternal}
      />
      <div style={{ position: "relative", flex: 1, background: "#0c1220" }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}

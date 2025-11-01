import { useEffect, useMemo, useState } from "react";
import type { AppTab } from "./TabBar";
import EmbeddedApp from "./EmbeddedApp";
import GlassHud, { type TabKey } from "./GlassHud";

const PLANTN_URL = "https://philiphov.github.io/Terrain-demotest/";
const PLANTID_URL = "https://philiphov.github.io/Tidsregistrering-test/";

type Props = {
  children: (active: AppTab) => React.ReactNode;
};

export default function TopBarAndContent({ children }: Props) {
  // læs fra hash/localStorage
  const getInitial = (): AppTab => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash === "planlog" || hash === "plantn" || hash === "plantid") return hash as AppTab;
    const stored = localStorage.getItem("haeren.activeApp") as AppTab | null;
    if (stored && ["planlog", "plantn", "plantid"].includes(stored)) return stored;
    return "planlog";
  };

  const [active, setActive] = useState<AppTab>(getInitial);

  // Expose active state via context or return value for GlassHeader
  // (GlassHeader handles its own onChange via hash)

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "planlog" || hash === "plantn" || hash === "plantid") {
        setActive(hash as AppTab);
        localStorage.setItem("haeren.activeApp", hash);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Keyboard shortcuts: 1/2/3
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey
      )
        return;
      if (e.key === "1") {
        window.location.hash = "#planlog";
        setActive("planlog");
      } else if (e.key === "2") {
        window.location.hash = "#plantn";
        setActive("plantn");
      } else if (e.key === "3") {
        window.location.hash = "#plantid";
        setActive("plantid");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const content = useMemo(() => {
    switch (active) {
      case "planlog":
        // viser dit nuværende kort/overblik (children med active state)
        return <>{children(active)}</>;
      case "plantn":
        return <EmbeddedApp url={PLANTN_URL} title="PlanTN – Terræn booking" />;
      case "plantid":
        return <EmbeddedApp url={PLANTID_URL} title="PlanTID – Tidsregistrering" />;
      default:
        return null;
    }
  }, [active, children]);

  return (
    <div style={{ minHeight: "100dvh", background: "#0f172a", color: "#ffffff", position: "relative" }}>
      {/* CONTENT */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, animation: "fadein 0.15s ease-in" }}>
        {content}
      </div>

      {/* ALWAYS-ON GLASS BAR på alle visninger */}
      <div style={{ position: "absolute", left: "16px", top: "16px", zIndex: 3000, pointerEvents: "auto" }}>
        <GlassHud active={active as TabKey} onChange={(k: TabKey) => {
          setActive(k as AppTab);
          localStorage.setItem("haeren.activeApp", k);
          window.location.hash = k;
        }} />
      </div>
    </div>
  );
}


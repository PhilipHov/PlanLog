import { useEffect, useState } from "react";
import GlassHud, { type TabKey } from "./GlassHud";

type Props = {
  PlanLogView: React.ReactNode;
};

const URLS = {
  plantn: "https://philiphov.github.io/Terrain-demotest/",
  plantid: "https://philiphov.github.io/Tidsregistrering-test/",
};

const getTab = (): TabKey => {
  const h = (window.location.hash.replace("#", "") || "planlog") as TabKey;
  return (["planlog", "plantn", "plantid"] as TabKey[]).includes(h) ? h : "planlog";
};

export default function AppSection({ PlanLogView }: Props) {
  const [tab, setTab] = useState<TabKey>(getTab());

  useEffect(() => {
    const onHash = () => setTab(getTab());
    window.addEventListener("hashchange", onHash);
    onHash(); // respekter initial hash
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (k: TabKey) => {
    window.location.hash = "#" + k;
  };

  return (
    <section style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
      {/* INDHOLD */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {tab === "planlog" && <div style={{ height: "100%", width: "100%" }}>{PlanLogView}</div>}
        {tab === "plantn" && <IframeFull src={URLS.plantn} />}
        {tab === "plantid" && <IframeFull src={URLS.plantid} />}
      </div>

      {/* GLASBAR – altid synlig */}
      <div style={{ position: "absolute", left: "16px", top: "16px", zIndex: 3000, pointerEvents: "auto" }}>
        <GlassHud active={tab} onChange={go} />
      </div>
    </section>
  );
}

function IframeFull({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      style={{ height: "100%", width: "100%", border: "none" }}
      loading="eager"
      referrerPolicy="no-referrer"
      allow="fullscreen"
    />
  );
}


import { useMemo, useState } from "react";
import {
  type MissionType,
  defaultMissionPreset,
  simulateAllocation,
  applyRecruitDelta,
  type GarrisonReadiness,
  type Role,
} from "../utils/beredskab";

type Props = {
  garrison: GarrisonReadiness;
};

const roleLabels: Record<Role, string> = {
  DRONE_PILOT: "Dronepilot",
  DRONE_OBS: "Observatør",
  VAGT_FOERER: "Vagtfører",
  VAGT_POST: "Vagtpost",
  HQ_OFF: "HQ (officer)",
  SAN: "Sanitet",
  KONSTABEL: "Konstabel",
};

const missionLabels: Record<MissionType, string> = {
  DRONE: "Droneberedskab",
  VAGT: "Vagt",
  UDSENDELSE: "Udsendelse",
};

function Kpi({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub?: string;
  tone?: "ok" | "bad";
}) {
  const color =
    tone === "ok" ? "#34d399" : tone === "bad" ? "#f87171" : "#e5e7eb";
  return (
    <div
      style={{
        borderRadius: "16px",
        background: "rgba(255,255,255,0.05)",
        padding: "16px"
      }}
    >
      <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "24px", fontWeight: 600, color }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}

export default function BeredskabView({ garrison }: Props) {
  const [mission, setMission] = useState<MissionType>("DRONE");
  const [recruitsPerRole, setRecruitsPerRole] = useState<Partial<Record<Role, number>>>({});
  const [days, setDays] = useState<number>(defaultMissionPreset("DRONE").days);
  const [shiftsPerDay, setShiftsPerDay] = useState<number>(defaultMissionPreset("DRONE").shiftsPerDay);
  const [hoursPerShift, setHoursPerShift] = useState<number>(defaultMissionPreset("DRONE").hoursPerShift);

  // Byg requirements dynamisk baseret på mission + manuel justering
  const requirement = useMemo(() => {
    const base = defaultMissionPreset(mission);
    return {
      ...base,
      days,
      shiftsPerDay,
      hoursPerShift,
    };
  }, [mission, days, shiftsPerDay, hoursPerShift]);

  const gWithDelta = useMemo(
    () => applyRecruitDelta(garrison, recruitsPerRole),
    [garrison, recruitsPerRole]
  );

  const plan = useMemo(() => simulateAllocation(gWithDelta, requirement), [gWithDelta, requirement]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Mission selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px", color: "#d1d5db" }}>Mission:</span>
        {(["DRONE", "VAGT", "UDSENDELSE"] as MissionType[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMission(m);
              const p = defaultMissionPreset(m);
              setDays(p.days);
              setShiftsPerDay(p.shiftsPerDay);
              setHoursPerShift(p.hoursPerShift);
            }}
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              background: mission === m ? "#2563eb" : "rgba(255,255,255,0.05)",
              color: mission === m ? "#ffffff" : "#d1d5db",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              if (mission !== m) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              if (mission !== m) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            {missionLabels[m]}
          </button>
        ))}
      </div>

      {/* Parametre */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>Dage</div>
          <input
            type="number"
            min={1}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#e5e7eb",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>Skift pr. dag</div>
          <input
            type="number"
            min={1}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#e5e7eb",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            value={shiftsPerDay}
            onChange={(e) => setShiftsPerDay(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>Timer pr. skift</div>
          <input
            type="number"
            min={1}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#e5e7eb",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            value={hoursPerShift}
            onChange={(e) => setHoursPerShift(Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>

      {/* What-if: rekrutter pr. rolle */}
      <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          What-if: ekstra rekrutter pr. rolle (engangstilføjelse)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <div
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                padding: "8px 12px"
              }}
            >
              <div style={{ fontSize: "14px" }}>{roleLabels[r]}</div>
              <input
                type="number"
                min={0}
                style={{
                  width: "96px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  textAlign: "right",
                  color: "#e5e7eb",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
                value={recruitsPerRole[r] ?? 0}
                onChange={(e) =>
                  setRecruitsPerRole((old) => ({ ...old, [r]: Math.max(0, Number(e.target.value)) }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* KPI / status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Kpi title="Dækning (personel)" value={`${plan.coveragePct}%`} />
        <Kpi
          title="Headcount"
          value={`${plan.headcountTotal.available} / ${plan.headcountTotal.needed}`}
          sub="tilknyttet / behov"
        />
        <Kpi
          title="Materiel"
          value={plan.equipmentOk ? "OK" : "Mangler"}
          sub={plan.equipmentNote ?? "Drone/Køretøj krav opfyldt"}
          tone={plan.equipmentOk ? "ok" : "bad"}
        />
        <Kpi title="Skift i alt" value={`${plan.shiftsTotal}`} />
      </div>

      {/* Gaps tabel */}
      <div style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Rolle-dækning</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#9ca3af" }}>
                <th style={{ textAlign: "left", padding: "8px 0" }}>Rolle</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Tilknyttet</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Behov</th>
                <th style={{ textAlign: "right", padding: "8px 0" }}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {plan.gaps.map((g) => {
                const gap = g.needed - g.assigned;
                const tone = gap === 0 ? "#34d399" : "#fbbf24";
                return (
                  <tr key={g.role} style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <td style={{ padding: "8px 0" }}>{roleLabels[g.role]}</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{g.assigned}</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{g.needed}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: tone }}>{gap}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* lille note */}
      <p style={{ fontSize: "12px", color: "#6b7280" }}>
        Bemærk: allokeringen er "greedy" (først-tilgængelige) og ignorerer overlappende skift på samme person. Den er
        velegnet til overblik/plan-what-if. Vi kan udvide til vagtplanlægning per individ, hvis du ønsker.
      </p>
    </div>
  );
}


// src/utils/beredskab.ts

export type MissionType = "DRONE" | "VAGT" | "UDSENDELSE";

export type Role =
  | "DRONE_PILOT"
  | "DRONE_OBS"
  | "VAGT_FOERER"
  | "VAGT_POST"
  | "HQ_OFF"
  | "SAN"
  | "KONSTABEL";

export interface Equipment {
  drones?: number;        // antal droner klar
  vehicles?: number;      // køretøjer klar
  mtbfHours?: number;     // MTBF for nøglemateriel
  slaPct?: number;        // SLA for nøglemateriel
}

export interface SkillPool {
  [role: string]: number; // antal personer med rollen/kompetencen
}

export interface GarrisonReadiness {
  id: string;
  name: string;
  personnelTotal: number;
  equipment: Equipment;
  skills: SkillPool;      // fx { DRONE_PILOT: 4, DRONE_OBS: 6, VAGT_POST: 18, ... }
}

export interface ShiftRequirement {
  role: Role;
  needed: number;
}

export interface MissionRequirement {
  mission: MissionType;
  // En standard "pakke" af roller til en vagt/dag
  perShift: ShiftRequirement[];
  hoursPerShift: number;       // fx 12
  shiftsPerDay: number;        // fx 2 (for 24/7)
  days: number;                // fx 7
  requireDrones?: number;      // fx 2 droner konstant
  requireVehicles?: number;    // optionelt
}

export interface Allocation {
  role: Role;
  assigned: number;
  needed: number;
}

export interface PlanResult {
  coveragePct: number;            // samlet % opfyldelse på personelet
  gaps: Allocation[];             // pr. rolle
  equipmentOk: boolean;           // opfylder drone/vehicle-krav
  equipmentNote?: string;
  headcountTotal: { needed: number; available: number };
  shiftsTotal: number;
}

export function defaultMissionPreset(m: MissionType): MissionRequirement {
  switch (m) {
    case "DRONE":
      return {
        mission: "DRONE",
        perShift: [
          { role: "DRONE_PILOT", needed: 2 },
          { role: "DRONE_OBS", needed: 1 },
          { role: "HQ_OFF", needed: 1 },
        ],
        hoursPerShift: 12,
        shiftsPerDay: 2,
        days: 7,
        requireDrones: 2,
      };
    case "VAGT":
      return {
        mission: "VAGT",
        perShift: [
          { role: "VAGT_FOERER", needed: 1 },
          { role: "VAGT_POST", needed: 8 },
          { role: "HQ_OFF", needed: 1 },
        ],
        hoursPerShift: 12,
        shiftsPerDay: 2,
        days: 7,
      };
    case "UDSENDELSE":
      return {
        mission: "UDSENDELSE",
        perShift: [
          { role: "HQ_OFF", needed: 2 },
          { role: "KONSTABEL", needed: 20 },
          { role: "SAN", needed: 2 },
        ],
        hoursPerShift: 24,
        shiftsPerDay: 1,
        days: 30,
        requireVehicles: 4,
      };
  }
}

export function simulateAllocation(
  g: GarrisonReadiness,
  req: MissionRequirement
): PlanResult {
  // Equipment check
  let equipmentOk = true;
  let equipmentNote: string | undefined;
  if (typeof req.requireDrones === "number") {
    if ((g.equipment.drones ?? 0) < req.requireDrones) {
      equipmentOk = false;
      equipmentNote = `Mangler droner: har ${(g.equipment.drones ?? 0)}, kræver ${req.requireDrones}`;
    }
  }
  if (equipmentOk && typeof req.requireVehicles === "number") {
    if ((g.equipment.vehicles ?? 0) < req.requireVehicles) {
      equipmentOk = false;
      equipmentNote = `Mangler køretøjer: har ${(g.equipment.vehicles ?? 0)}, kræver ${req.requireVehicles}`;
    }
  }

  // Greedy allocation pr. rolle
  const shifts = req.shiftsPerDay * req.days;
  const gaps: Allocation[] = req.perShift.map((r) => {
    const neededTotal = r.needed * shifts;
    const available = g.skills[r.role] ?? 0;
    const assigned = Math.min(available, neededTotal);
    return { role: r.role, assigned, needed: neededTotal };
  });

  const neededAll = gaps.reduce((s, x) => s + x.needed, 0);
  const assignedAll = gaps.reduce((s, x) => s + x.assigned, 0);
  const coveragePct = neededAll === 0 ? 100 : Math.round((assignedAll / neededAll) * 100);

  return {
    coveragePct,
    gaps,
    equipmentOk,
    equipmentNote,
    headcountTotal: { needed: neededAll, available: assignedAll },
    shiftsTotal: shifts,
  };
}

// lille helper til "what-if": ekstra rekrutter med bestemte roller
export function applyRecruitDelta(
  base: GarrisonReadiness,
  add: Partial<Record<Role, number>>
): GarrisonReadiness {
  const skills: SkillPool = { ...base.skills };

  Object.keys(add).forEach((k) => {
    const key = k as Role;
    skills[key] = (skills[key] ?? 0) + (add[key] ?? 0);
  });

  return { ...base, skills };
}


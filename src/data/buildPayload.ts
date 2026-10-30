import { toothInfo } from "./toothLabels";
import { ONSETS, TRIGGERS, type OnsetId, type TriggerId } from "./history";
import { tierOf, type Tier } from "./severity";
import type { PainType } from "./painTypes";

export interface PainEntry {
  region: "tooth" | "gum";
  toothNumber: number | null; // universal numbering 1-32, null for gums
  quadrant: 1 | 2 | 3 | 4; // 1 UR, 2 UL, 3 LL, 4 LR (patient's side)
  name: string; // clinical name, e.g. "Upper right central incisor"
  severity: number; // 1-10
  tier: Tier;
  painTypes: PainType[];
}

export interface IntakePayload {
  version: 1;
  entries: PainEntry[];
  onset: { id: OnsetId; label: string } | null;
  triggers: { id: TriggerId; label: string }[];
}

export function buildPayload(input: {
  selected: ReadonlySet<number>;
  severity: ReadonlyMap<number, number>;
  painTypes: ReadonlyMap<number, ReadonlySet<PainType>>;
  onset: OnsetId | null;
  triggers: ReadonlySet<TriggerId>;
}): IntakePayload {
  const entries = Array.from(input.selected)
    .sort((a, b) => a - b)
    .flatMap((id): PainEntry[] => {
      const v = input.severity.get(id);
      if (v === undefined) return [];
      const info = toothInfo(id);
      return [
        {
          region: id > 32 ? "gum" : "tooth",
          toothNumber: id > 32 ? null : id,
          quadrant: info.quadrant,
          name: info.clinical,
          severity: v,
          tier: tierOf(v),
          painTypes: Array.from(input.painTypes.get(id) ?? []),
        },
      ];
    });

  return {
    version: 1,
    entries,
    onset: ONSETS.find((o) => o.id === input.onset) ?? null,
    triggers: TRIGGERS.filter((t) => input.triggers.has(t.id)),
  };
}
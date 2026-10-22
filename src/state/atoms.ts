import { atom } from "jotai";
import type { Tooth } from "../data/toothRegistry";
import type { PainType } from "../data/painTypes";
import type { OnsetId, TriggerId } from "../data/history";


export const registryAtom = atom<Tooth[]>([]);

export const hoveredToothAtom = atom<number | null>(null);

export const selectedTeethAtom = atom<ReadonlySet<number>>(new Set<number>());

export const severityAtom = atom<ReadonlyMap<number, number>>(
  new Map<number, number>()
);

export const activeToothAtom = atom<number | null>(null);

export const stepAtom = atom<0 | 1 | 2>(0);

export const setSeverityAtom = atom(null, (get, set, value: number) => {
  const id = get(activeToothAtom);
  if (id === null) return;
  const next = new Map(get(severityAtom));
  if (value <= 0) next.delete(id);
  else next.set(id, value);
  set(severityAtom, next);
});

export const painTypesAtom = atom<ReadonlyMap<number, ReadonlySet<PainType>>>(
  new Map<number, ReadonlySet<PainType>>()
);

export const togglePainTypeAtom = atom(null, (get, set, type: PainType) => {
  const id = get(activeToothAtom);
  if (id === null) return;
  const next = new Map(get(painTypesAtom));
  const types = new Set(next.get(id) ?? []);
  if (types.has(type)) types.delete(type);
  else types.add(type);
  if (types.size === 0) next.delete(id);
  else next.set(id, types);
  set(painTypesAtom, next);
});



    //this toggle lets the tooth carry severity slider to next pain

// export const toggleToothAtom = atom(null, (get, set, id: number) => {
//   const selected = new Set(get(selectedTeethAtom));
//   const severity = new Map(get(severityAtom));
//   const painTypes = new Map(get(painTypesAtom));

//   if (selected.has(id)) {
//     selected.delete(id);
//     severity.delete(id);
//     painTypes.delete(id);
//     if (get(activeToothAtom) === id) {
//       const remaining = Array.from(selected);
//       set(activeToothAtom, remaining.length ? remaining[remaining.length - 1] : null);
//     }
//   } else {
//     const prev = get(activeToothAtom);
//     selected.add(id);
//     if (prev !== null) {
//       const sev = severity.get(prev);
//       if (sev !== undefined) severity.set(id, sev);
//       const types = painTypes.get(prev);
//       if (types) painTypes.set(id, new Set(types));
//     }
//     set(activeToothAtom, id);
//   }

//   set(selectedTeethAtom, selected);
//   set(severityAtom, severity);
//   set(painTypesAtom, painTypes);
// });

export const toggleToothAtom = atom(null, (get, set, id: number) => {
  const selected = new Set(get(selectedTeethAtom));
  const severity = new Map(get(severityAtom));
  const painTypes = new Map(get(painTypesAtom));

  if (selected.has(id)) {
    selected.delete(id);
    severity.delete(id);
    painTypes.delete(id);
    if (selected.size === 0) set(stepAtom, 0);
    if (get(activeToothAtom) === id) {
      const remaining = Array.from(selected);
      set(activeToothAtom, remaining.length ? remaining[remaining.length - 1] : null);
    }
  } else {
    selected.add(id);
    set(activeToothAtom, id);
  }

  set(selectedTeethAtom, selected);
  set(severityAtom, severity);
  set(painTypesAtom, painTypes);
});

export const clearSelectionAtom = atom(null, (_get, set) => {
  set(selectedTeethAtom, new Set<number>());
  set(severityAtom, new Map<number, number>());
  set(painTypesAtom, new Map<number, ReadonlySet<PainType>>());
  set(activeToothAtom, null);
  set(stepAtom, 0);
});


const INTRO_KEY = "teeth-intro-seen";

function introSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberIntroSeen() {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* storage can fail, ignore */
  }
}

export const introOpenAtom = atom<boolean>(!introSeen());

export const onsetAtom = atom<OnsetId | null>(null);

export const triggersAtom = atom<ReadonlySet<TriggerId>>(new Set<TriggerId>());

export const toggleTriggerAtom = atom(null, (get, set, id: TriggerId) => {
  const next = new Set(get(triggersAtom));
  if (next.has(id)) next.delete(id);
  else next.add(id);
  set(triggersAtom, next);
});

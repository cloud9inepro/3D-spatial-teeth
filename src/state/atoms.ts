import { atom } from "jotai";
import type { Tooth } from "../data/toothRegistry";

export const registryAtom = atom<Tooth[]>([]);

export const hoveredToothAtom = atom<number | null>(null);

export const selectedTeethAtom = atom<ReadonlySet<number>>(new Set<number>());

export const severityAtom = atom<ReadonlyMap<number, number>>(
  new Map<number, number>()
);

export const activeToothAtom = atom<number | null>(null);

export const setSeverityAtom = atom(null, (get, set, value: number) => {
  const id = get(activeToothAtom);
  if (id === null) return;
  const next = new Map(get(severityAtom));
  if (value <= 0) next.delete(id);
  else next.set(id, value);
  set(severityAtom, next);
});

export const toggleToothAtom = atom(null, (get, set, id: number) => {
  const selected = new Set(get(selectedTeethAtom));
  const severity = new Map(get(severityAtom));

  if (selected.has(id)) {
    selected.delete(id);
    severity.delete(id);
    if (get(activeToothAtom) === id) {
      const remaining = Array.from(selected);
      set(activeToothAtom, remaining.length ? remaining[remaining.length - 1] : null);
    }
  } else {
    const prev = get(activeToothAtom);
    const inherited = prev !== null ? severity.get(prev) : undefined;
    selected.add(id);
    if (inherited !== undefined) severity.set(id, inherited);
    set(activeToothAtom, id);
  }

  set(selectedTeethAtom, selected);
  set(severityAtom, severity);
});

export const clearSelectionAtom = atom(null, (_get, set) => {
  set(selectedTeethAtom, new Set<number>());
  set(severityAtom, new Map<number, number>());
  set(activeToothAtom, null);
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


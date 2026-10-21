import { atom } from "jotai";
import type { Tooth } from "../data/toothRegistry";

export const registryAtom = atom<Tooth[]>([]);

export const hoveredToothAtom = atom<number | null>(null);

export const selectedTeethAtom = atom<ReadonlySet<number>>(new Set<number>());

export const toggleToothAtom = atom(null, (get, set, id: number) => {
  const next = new Set(get(selectedTeethAtom));
  if (next.has(id)) next.delete(id);
  else next.add(id);
  set(selectedTeethAtom, next);
});

export const clearSelectionAtom = atom(null, (_get, set) => {
  set(selectedTeethAtom, new Set<number>());
});
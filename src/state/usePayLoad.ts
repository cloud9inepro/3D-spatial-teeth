import { useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  onsetAtom,
  painTypesAtom,
  selectedTeethAtom,
  severityAtom,
  triggersAtom,
} from "./atoms";
import { buildPayload } from "../data/buildPayload";

export function useIntakePayload() {
  const selected = useAtomValue(selectedTeethAtom);
  const severity = useAtomValue(severityAtom);
  const painTypes = useAtomValue(painTypesAtom);
  const onset = useAtomValue(onsetAtom);
  const triggers = useAtomValue(triggersAtom);

  return useMemo(
    () => buildPayload({ selected, severity, painTypes, onset, triggers }),
    [selected, severity, painTypes, onset, triggers]
  );
}

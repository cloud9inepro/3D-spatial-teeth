import { useAtomValue, useSetAtom } from "jotai";
import {
  clearSelectionAtom,
  selectedTeethAtom,
  toggleToothAtom,
} from "../state/atoms";
import { toothInfo } from "../data/toothLabels";
import { activeToothAtom, severityAtom } from "../state/atoms";
import { TIER_COLOR, tierOf } from "../data/severity";
import SeveritySlider from "./SeveritySlider";




export default function Panel() {
  const selected = useAtomValue(selectedTeethAtom);
  const toggle = useSetAtom(toggleToothAtom);
  const clear = useSetAtom(clearSelectionAtom);
  const active = useAtomValue(activeToothAtom);
const setActive = useSetAtom(activeToothAtom);
const severity = useAtomValue(severityAtom);

  const ids = Array.from(selected).sort((a, b) => a - b);

  return (
    <aside className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-t-3xl bg-stone-50 p-5 text-stone-800 md:w-1/3 md:flex-none md:rounded-none">
      <header>
        <h1 className="text-xl font-medium">Where does it hurt?</h1>
        <p className="text-sm text-stone-500">
          Tap the teeth that are bothering you.
        </p>
      </header>

      <div aria-live="polite" className="text-sm font-medium">
        {ids.length === 0 ? "No teeth selected" : `${ids.length} selected`}
      </div>

      {ids.length === 0 ? (
        <p className="text-stone-400">Tap a tooth to begin.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {ids.map((id) => {
  const { label } = toothInfo(id);
  const v = severity.get(id);
  const isActive = id === active;
  return (
    <li
      key={id}
      className={`flex items-center rounded-full border bg-white ${
        isActive ? "border-stone-800" : "border-stone-300"
      }`}
    >
      <button
        type="button"
        onClick={() => setActive(id)}
        aria-pressed={isActive}
        className="flex items-center gap-2 py-2 pl-3 pr-2 text-sm"
      >
        {v !== undefined && (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: TIER_COLOR[tierOf(v)] }}
          />
        )}
        {label}
      </button>
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-label={`Remove ${label}`}
        className="py-2 pl-1 pr-3 text-sm"
      >
        ×
      </button>
    </li>
  );
})}

        </ul>
      )}

      {ids.length > 0 && (
        <button
          type="button"
          onClick={() => clear()}
          className="self-start text-sm text-stone-500 underline"
        >
          Clear all
        </button>
      )}
      <SeveritySlider/>
    </aside>
  );
}
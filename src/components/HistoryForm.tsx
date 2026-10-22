import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { onsetAtom, toggleTriggerAtom, triggersAtom } from "../state/atoms";
import { ONSETS, TRIGGERS } from "../data/history";

const CARD =
  "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 " +
  "peer-checked:border-stone-800 peer-checked:bg-stone-800 peer-checked:text-white " +
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stone-800";

export default function HistoryForm() {
  const [onset, setOnset] = useAtom(onsetAtom);
  const triggers = useAtomValue(triggersAtom);
  const toggleTrigger = useSetAtom(toggleTriggerAtom);

  return (
    <>
      <fieldset className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4">
        <legend className="px-1 text-base font-medium">
          When did it start?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {ONSETS.map((o) => (
            <label key={o.id} className="relative">
              <input
                type="radio"
                name="onset"
                value={o.id}
                checked={onset === o.id}
                onChange={() => setOnset(o.id)}
                className="peer sr-only"
              />
              <span className={CARD}>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4">
        <legend className="px-1 text-base font-medium">
          What sets it off?
        </legend>
        <p className="text-sm text-stone-500">Pick any that apply</p>
        <div className="flex flex-col gap-2">
          {TRIGGERS.map((t) => (
            <label key={t.id} className="relative">
              <input
                type="checkbox"
                checked={triggers.has(t.id)}
                onChange={() => toggleTrigger(t.id)}
                className="peer sr-only"
              />
              <span className={CARD}>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeToothAtom,
  painTypesAtom,
  togglePainTypeAtom,
} from "../state/atoms";
import { toothInfo } from "../data/toothLabels";
import { PAIN_TYPES } from "../data/painTypes";

export default function PainTypeButtons() {
  const active = useAtomValue(activeToothAtom);
  const painTypes = useAtomValue(painTypesAtom);
  const toggle = useSetAtom(togglePainTypeAtom);

  if (active === null) return null;

  const chosen = painTypes.get(active);
  const { label } = toothInfo(active);

  return (
    <section
      role="group"
      aria-labelledby="type-title"
      className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4"
    >
      <div>
        <h2 id="type-title" className="text-base font-medium">
          What does it feel like?
        </h2>
        <p className="text-sm text-stone-500">{label} · pick any that fit</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        
        {PAIN_TYPES.map((p) => {
          const on = chosen?.has(p.id) ?? false;
          const Icon = p.icon
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className={`flex min-h-[64px] flex-col items-start gap-0.5 rounded-xl border p-3 text-left text-sm ${
                on
                  ? "border-stone-800 bg-stone-800 text-white"
                  : "border-stone-300 bg-white text-stone-800"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0"/>
                {p.label}
              </span>
              <span
                className={`text-xs ${on ? "text-stone-300" : "text-stone-500"}`}
              >
                {p.hint}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeToothAtom,
  clearSelectionAtom,
  onsetAtom,
  selectedTeethAtom,
  severityAtom,
  stepAtom,
  toggleToothAtom,
} from "../state/atoms";
import { toothInfo } from "../data/toothLabels";
import { TIER_COLOR, tierOf } from "../data/severity";
import SeveritySlider from "./SeveritySlider";
import PainTypeButtons from "./PainTypeButtons";
import HistoryForm from "./HistoryForm";

const STEPS = ["Select", "Describe", "History"];

const HEADINGS = [
  { title: "Where does it hurt?", sub: "Tap the teeth that are bothering you." },
  { title: "Describe the pain", sub: "Do this for each tooth you picked." },
  { title: "A few last questions", sub: "This helps the dentist understand." },
];

export default function Panel() {
  const selected = useAtomValue(selectedTeethAtom);
  const severity = useAtomValue(severityAtom);
  const onset = useAtomValue(onsetAtom);
  const active = useAtomValue(activeToothAtom);
  const setActive = useSetAtom(activeToothAtom);
  const toggle = useSetAtom(toggleToothAtom);
  const clear = useSetAtom(clearSelectionAtom);
  const [step, setStep] = useAtom(stepAtom);

  const ids = Array.from(selected).sort((a, b) => a - b);
  const unrated = ids.filter((id) => !severity.has(id));
  const current = ids.length === 0 ? 0 : step;

  const canNext =
    current === 0
      ? ids.length > 0
      : current === 1
      ? unrated.length === 0
      : onset !== null;

  const hint =
    current === 1 && unrated.length > 0
      ? `Still need a pain level: ${unrated
          .map((id) => toothInfo(id).label)
          .join(", ")}`
      : current === 2 && onset === null
      ? "Choose when it started to finish"
      : "";

  const goNext = () => {
    if (current < 2) setStep((current + 1) as 0 | 1 | 2);
    // Done: output comes in a later step
  };

  const chips = (
    <ul className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const { label } = toothInfo(id);
        const v = severity.get(id);
        const isActive = current === 1 && id === active;
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
  );

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl bg-stone-50 text-stone-800 md:w-1/3 md:flex-none md:rounded-none">
      <div
        key={current}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
      >
        <ol className="flex gap-2" aria-label="Progress">
          {STEPS.map((name, i) => (
            <li
              key={name}
              aria-current={i === current ? "step" : undefined}
              className="flex-1"
            >
              <div
                className={`h-1.5 rounded-full ${
                  i <= current ? "bg-stone-800" : "bg-stone-200"
                }`}
              />
              <span
                className={`mt-1 block text-xs ${
                  i === current ? "font-medium text-stone-800" : "text-stone-400"
                }`}
              >
                {i + 1}. {name}
              </span>
            </li>
          ))}
        </ol>

        <header>
          <h1 className="text-xl font-medium">{HEADINGS[current].title}</h1>
          <p className="text-sm text-stone-500">{HEADINGS[current].sub}</p>
        </header>

        {current === 0 && (
          <>
            <div aria-live="polite" className="text-sm font-medium">
              {ids.length === 0 ? "No teeth selected" : `${ids.length} selected`}
            </div>
            {ids.length === 0 ? (
              <p className="text-stone-400">Tap a tooth to begin.</p>
            ) : (
              chips
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
          </>
        )}

        {current === 1 && (
          <>
            {chips}
            <SeveritySlider />
            <PainTypeButtons />
          </>
        )}

        {current === 2 && <HistoryForm />}
      </div>

      <footer className="shrink-0 border-t border-stone-200 bg-stone-50 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p
          aria-live="polite"
          className="mb-2 min-h-[1.25rem] text-xs text-stone-500"
        >
          {hint}
        </p>
        <div className="flex gap-3">
          {current > 0 && (
            <button
              type="button"
              onClick={() => setStep((current - 1) as 0 | 1 | 2)}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className="flex-1 rounded-full bg-stone-800 py-3 text-sm font-medium text-white disabled:bg-stone-300"
          >
            {current === 2 ? "Done" : "Next"}
          </button>
        </div>
      </footer>
    </aside>
  );
}

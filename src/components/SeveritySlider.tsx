import { useAtomValue, useSetAtom } from "jotai";
import {
  activeToothAtom,
  setSeverityAtom,
  severityAtom,
} from "../state/atoms";
import { toothInfo } from "../data/toothLabels";
import { TIER_COLOR, TIER_LABEL, tierOf } from "../data/severity";

export default function SeveritySlider() {
  const active = useAtomValue(activeToothAtom);
  const severity = useAtomValue(severityAtom);
  const setSeverity = useSetAtom(setSeverityAtom);

  if (active === null) return null;

  const v = severity.get(active) ?? 0;
  const tier = v > 0 ? tierOf(v) : null;
  const { label } = toothInfo(active);

  return (
    <section
      aria-labelledby="sev-title"
      className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4"
    >
      <div>
        <h2 id="sev-title" className="text-base font-medium">
          How bad is the pain?
        </h2>
        <p className="text-sm text-stone-500">{label}</p>
      </div>

      <div className="flex items-center gap-2" aria-live="polite">
        {tier && (
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ background: TIER_COLOR[tier] }}
          />
        )}
        <span className="text-3xl font-medium">{v > 0 ? v : "–"}</span>
        <span className="text-sm text-stone-500">
          {tier ? `· ${TIER_LABEL[tier]}` : "Move the slider to set it"}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={v}
        onChange={(e) => setSeverity(Number(e.target.value))}
        aria-label={`Pain level for ${label}`}
        aria-valuetext={
          v > 0
            ? `${v} out of 10, ${TIER_LABEL[tierOf(v)].toLowerCase()}`
            : "Not set"
        }
        className="severity"
      />

      <div
        className="grid text-center text-xs text-stone-400"
        style={{ gridTemplateColumns: "5% 30% 40% 25%" }}
      >
        <span />
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </section>
  );
}

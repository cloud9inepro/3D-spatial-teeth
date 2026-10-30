import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { doneAtom, resetAllAtom } from "../state/atoms";
import { useIntakePayload } from "../state/usePayLoad";
import { toothInfo } from "../data/toothLabels";
import { PAIN_TYPES } from "../data/painTypes";
import { TIER_COLOR, TIER_LABEL } from "../data/severity";
import Credits from "./Credits";

export default function Summary() {
  const payload = useIntakePayload();
  const setDone = useSetAtom(doneAtom);
  const reset = useSetAtom(resetAllAtom);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const json = JSON.stringify(payload, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard can be blocked, ignore */
    }
  };

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl bg-stone-50 text-stone-800 md:w-1/3 md:flex-none md:rounded-none">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <header>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-medium outline-none"
          >
            Your summary
          </h1>
          <p className="text-sm text-stone-500">
            Check this looks right before you share it with the dentist.
          </p>
        </header>

        <ul className="flex flex-col gap-2">
          {payload.entries.map((e) => {
            const id = e.toothNumber ?? 32 + e.quadrant;
            return (
              <li
                key={id}
                className="rounded-2xl border border-stone-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {toothInfo(id).label}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: TIER_COLOR[e.tier] }}
                    />
                    {e.severity}/10 · {TIER_LABEL[e.tier]}
                  </span>
                </div>
                {e.painTypes.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {e.painTypes.map((p) => (
                      <li
                        key={p}
                        className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
                      >
                        {PAIN_TYPES.find((t) => t.id === p)?.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <dl className="rounded-2xl border border-stone-200 bg-white p-3 text-sm">
          <dt className="text-stone-500">Started</dt>
          <dd className="mb-2 font-medium">
            {payload.onset?.label ?? "Not answered"}
          </dd>
          <dt className="text-stone-500">Triggers</dt>
          <dd className="font-medium">
            {payload.triggers.length
              ? payload.triggers.map((t) => t.label).join(", ")
              : "None selected"}
          </dd>
        </dl>

        <details className="rounded-2xl border border-stone-200 bg-white p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Data for the dentist
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-stone-900 p-3 text-xs text-stone-100">
            {json}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="mt-3 rounded-full border border-stone-300 px-4 py-2 text-sm"
          >
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </details>
        <Credits/>
      </div>

      <footer className="flex shrink-0 gap-3 border-t border-stone-200 bg-stone-50 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => reset()}
          className="flex-1 rounded-full border border-stone-300 py-3 text-sm"
        >
          Start over
        </button>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="flex-1 rounded-full bg-stone-800 py-3 text-sm font-medium text-white"
        >
          Edit answers
        </button>
      </footer>
    </aside>
  );
}
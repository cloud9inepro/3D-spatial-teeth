import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { introOpenAtom, registryAtom, rememberIntroSeen } from "../state/atoms";

const ROTATE = "M20 12a8 8 0 1 1-2.5-5.8M20 4v4h-4";
const TAP =
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z";
const ZOOM =
  "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3M11 8v6M8 11h6";

const TIPS = [
  { d: ROTATE, text: "Drag to turn the teeth" },
  { d: TAP, text: "Tap a tooth that hurts. Tap it again to remove it." },
  { d: ZOOM, text: "Pinch or scroll to zoom in" },
];

export default function IntroCard() {
  const ready = useAtomValue(registryAtom).length > 0;
  const [open, setOpen] = useAtom(introOpenAtom);
  const doneRef = useRef<HTMLButtonElement>(null);
  const visible = ready && open;

  useEffect(() => {
    if (!visible) return;
    doneRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        rememberIntroSeen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, setOpen]);

  const close = () => {
    setOpen(false);
    rememberIntroSeen();
  };

  if (!ready) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="How to use this"
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg font-medium text-stone-800"
      >
        ?
      </button>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
      <div
        role="dialog"
        aria-labelledby="intro-title"
        className="intro-in pointer-events-auto w-full max-w-sm rounded-2xl bg-white p-4 text-stone-800 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="intro-title" className="text-base font-medium">
            How to use this
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-1 -mt-1 grid h-8 w-8 place-items-center text-xl text-stone-500"
          >
            ×
          </button>
        </div>

        <ul className="mt-3 flex flex-col gap-3 text-sm">
          {TIPS.map((t) => (
            <li key={t.text} className="flex items-center gap-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 text-stone-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={t.d} />
              </svg>
              {t.text}
            </li>
          ))}
        </ul>

        <button
          ref={doneRef}
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-full bg-stone-800 py-2.5 text-sm font-medium text-white transition-all duration-150 ease-in-out  active:scale-95 active:shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
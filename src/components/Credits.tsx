const MODEL_TITLE = "Chattering Teeth";
const MODEL_AUTHOR = "JAFM800";
const MODEL_URL = "https://sketchfab.com/3d-models/chattering-teeth-7ab157e40e454086bda284d65ae3b7fd";

const LINK = "underline underline-offset-2";

export default function Credits() {
  return (
    <div className="mt-auto flex flex-col gap-1 pt-4 text-xs text-stone-500">
      <p>
        Demo only. Not for real patient data. Nothing you enter leaves your
        browser.
      </p>
      <p>
        Teeth model &ldquo;
        <a href={MODEL_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
          {MODEL_TITLE}
        </a>
        &rdquo; by {MODEL_AUTHOR},{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          CC BY 4.0
        </a>
        . Modified: separated into individual teeth, some teeth removed.
      </p>
    </div>
  );
}
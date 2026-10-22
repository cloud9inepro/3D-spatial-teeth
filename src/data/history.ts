export type OnsetId = "today" | "days" | "week" | "intermittent";
export type TriggerId = "sweets" | "biting" | "temperature" | "touch";

export const ONSETS: { id: OnsetId; label: string }[] = [
  { id: "today", label: "Just started today" },
  { id: "days", label: "A few days" },
  { id: "week", label: "Over a week" },
  { id: "intermittent", label: "Comes and goes" },
];

export const TRIGGERS: { id: TriggerId; label: string }[] = [
  { id: "sweets", label: "Sweet foods or drinks" },
  { id: "biting", label: "Biting pressure" },
  { id: "temperature", label: "Sudden temperature changes" },
  { id: "touch", label: "Touching the tooth" },
];
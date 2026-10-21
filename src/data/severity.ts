export type Tier = "mild" | "moderate" | "severe";

export function tierOf(v: number): Tier {
  return v <= 3 ? "mild" : v <= 7 ? "moderate" : "severe";
}

export const TIER_LABEL: Record<Tier, string> = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

export const TIER_COLOR: Record<Tier, string> = {
  mild: "#facc15",
  moderate: "#fb923c",
  severe: "#ef4444",
};
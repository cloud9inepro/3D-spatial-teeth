import type {IconType} from "react-icons"
import {LuZap, LuWaves, LuThermometerSnowflake, LuHammer} from "react-icons/lu"

export type PainType = "sharp" | "dull" | "thermal" | "pressure";

export const PAIN_TYPES: {
  id: PainType;
  icon: IconType;
  label: string;
  hint: string;
}[] = [
  { id: "sharp", icon: LuZap, label: "Sharp or stabbing", hint: "Sudden and strong" },
  { id: "dull", icon: LuWaves, label: "Dull or throbbing", hint: "Constant, aching" },
  { id: "thermal", icon: LuThermometerSnowflake, label: "Hot or cold", hint: "Reacts to temperature" },
  { id: "pressure", icon: LuHammer, label: "Pressure", hint: "Hurts when biting or touched" },
];
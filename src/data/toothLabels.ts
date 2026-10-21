export type Quadrant = 1 | 2 | 3 | 4;

const QUADRANT_NAME: Record<Quadrant, string> = {
  1: "Upper right",
  2: "Upper left",
  3: "Lower left",
  4: "Lower right",
};

// index = position counted from the middle of the mouth (1-8)
const FRIENDLY = [
  "",
  "front tooth",
  "side front tooth",
  "pointed tooth",
  "chewing tooth 1",
  "chewing tooth 2",
  "back tooth 1",
  "back tooth 2",
  "wisdom tooth",
];

const CLINICAL = [
  "",
  "central incisor",
  "lateral incisor",
  "canine",
  "first premolar",
  "second premolar",
  "first molar",
  "second molar",
  "third molar",
];

export interface ToothInfo {
  quadrant: Quadrant;
  position: number; // 1 = nearest the middle, 8 = wisdom tooth
  label: string; // what the patient sees
  clinical: string; // what the dentist gets in the output
}

export function toothInfo(id: number): ToothInfo {
  const quadrant = Math.ceil(id / 8) as Quadrant;
  const position =
    quadrant === 1 ? 9 - id :
    quadrant === 2 ? id - 8 :
    quadrant === 3 ? 25 - id :
    id - 24;

  return {
    quadrant,
    position,
    label: `${QUADRANT_NAME[quadrant]} ${FRIENDLY[position]}`,
    clinical: `${QUADRANT_NAME[quadrant]} ${CLINICAL[position]}`,
  };
}
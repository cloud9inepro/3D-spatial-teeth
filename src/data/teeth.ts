
export type Arch = "upper" | "lower";
export type ToothType = "incisor" | "canine" | "premolar" | "molar";

export interface ToothData {
  id: number; // universal numbering 1-32, internal only
  arch: Arch;
  quadrant: 1 | 2 | 3 | 4; // 1 UR, 2 UL, 3 LL, 4 LR (patient's side)
  type: ToothType;
  name: string;
  width: number;
  position: [number, number, number];
  rotationY: number;
}

// Arch curve: z = Z_FRONT - K * x^2 (front teeth face the camera at +z)
const K = 0.45;
const Z_FRONT = 1.6;
const ARCH_Y: Record<Arch, number> = { upper: 0.5, lower: -0.5 };

// Ordered from the midline outward
const SIDE: { name: string; type: ToothType; width: number }[] = [
  { name: "Central incisor", type: "incisor", width: 0.38 },
  { name: "Lateral incisor", type: "incisor", width: 0.32 },
  { name: "Canine", type: "canine", width: 0.36 },
  { name: "First premolar", type: "premolar", width: 0.34 },
  { name: "Second premolar", type: "premolar", width: 0.34 },
  { name: "First molar", type: "molar", width: 0.5 },
  { name: "Second molar", type: "molar", width: 0.5 },
  { name: "Third molar", type: "molar", width: 0.44 },
];

// Arc-length lookup so teeth sit evenly along the curve
const STEPS = 400;
const X_MAX = 4;
const xs: number[] = [];
const ls: number[] = [];
{
  let len = 0;
  for (let i = 0; i <= STEPS; i++) {
    const x = (i / STEPS) * X_MAX;
    if (i > 0) {
      const px = xs[i - 1];
      const mx = (x + px) / 2;
      len += (x - px) * Math.sqrt(1 + (2 * K * mx) ** 2);
    }
    xs.push(x);
    ls.push(len);
  }
}

function xAtArc(s: number): number {
  for (let i = 1; i < ls.length; i++) {
    if (ls[i] >= s) {
      const t = (s - ls[i - 1]) / (ls[i] - ls[i - 1]);
      return xs[i - 1] + t * (xs[i] - xs[i - 1]);
    }
  }
  return xs[xs.length - 1];
}

function buildSide(arch: Arch, sign: -1 | 1): ToothData[] {
  // sign -1 = viewer's left = patient's right
  const out: ToothData[] = [];
  let cursor = 0;

  SIDE.forEach((spec, i) => {
    const center = cursor + spec.width / 2;
    cursor += spec.width;

    const x = sign * xAtArc(center);
    const z = Z_FRONT - K * x * x;

    let id: number;
    let quadrant: 1 | 2 | 3 | 4;
    if (arch === "upper") {
      id = sign === -1 ? 8 - i : 9 + i;
      quadrant = sign === -1 ? 1 : 2;
    } else {
      id = sign === 1 ? 24 - i : 25 + i;
      quadrant = sign === 1 ? 3 : 4;
    }

    out.push({
      id,
      arch,
      quadrant,
      type: spec.type,
      name: spec.name,
      width: spec.width,
      position: [x, ARCH_Y[arch], z],
      rotationY: Math.atan(2 * K * x),
    });
  });

  return out;
}

export const TEETH: ToothData[] = [
  ...buildSide("upper", -1),
  ...buildSide("upper", 1),
  ...buildSide("lower", 1),
  ...buildSide("lower", -1),
].sort((a, b) => a.id - b.id);
// console.log(TEETH.length, TEETH[0])
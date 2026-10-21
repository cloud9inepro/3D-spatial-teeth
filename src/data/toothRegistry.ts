import * as THREE from "three";

export type Arch = "upper" | "lower";
export type ToothType = "incisor" | "canine" | "premolar" | "molar";

export interface Tooth {
  id: number; // 1-32 universal numbering, internal only
  arch: Arch;
  quadrant: 1 | 2 | 3 | 4; // 1 UR, 2 UL, 3 LL, 4 LR (patient's side)
  type: ToothType;
  mesh: THREE.Mesh;
  center: THREE.Vector3;
}

// index 0 = back molar on the patient's right, 15 = back molar on the left
const TYPE_BY_INDEX: ToothType[] = [
  "molar", "molar", "molar", "premolar", "premolar", "canine", "incisor", "incisor",
  "incisor", "incisor", "canine", "premolar", "premolar", "molar", "molar", "molar",
];

type Item = { mesh: THREE.Mesh; c: THREE.Vector3 };

// Returns the 16 teeth of one arch, ordered patient's right -> left
function orderArch(items: Item[]): Item[] {
  const cx = items.reduce((s, i) => s + i.c.x, 0) / items.length;
  const cz = items.reduce((s, i) => s + i.c.z, 0) / items.length;

  const withAngle = items
    .map((i) => ({ ...i, a: Math.atan2(i.c.z - cz, i.c.x - cx) }))
    .sort((p, q) => p.a - q.a);

  // the biggest angular gap is the open back of the arch
  let gapIndex = 0;
  let gapSize = -1;
  let gapMid = 0;
  for (let i = 0; i < withAngle.length; i++) {
    const next = withAngle[(i + 1) % withAngle.length];
    let gap = next.a - withAngle[i].a;
    if (gap <= 0) gap += Math.PI * 2;
    if (gap > gapSize) {
      gapSize = gap;
      gapIndex = i;
      gapMid = withAngle[i].a + gap / 2;
    }
  }

  const seq = [
    ...withAngle.slice(gapIndex + 1),
    ...withAngle.slice(0, gapIndex + 1),
  ];

  // front = opposite of the gap direction (in the x/z plane)
  const fx = -Math.cos(gapMid);
  const fz = -Math.sin(gapMid);
  // viewer's right when looking at the front of the arch
  const rx = fz;
  const rz = -fx;

  const first = seq[0];
  const dot = (first.c.x - cx) * rx + (first.c.z - cz) * rz;
  if (dot > 0) seq.reverse(); // index 0 must sit on the patient's right

  return seq;
}

export function buildRegistry(root: THREE.Object3D): Tooth[] {
  root.updateWorldMatrix(true, true);

  const items: Item[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.name.startsWith("Box002_01")) return; // skip gums
    const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
    items.push({ mesh: m, c });
  });

  if (items.length !== 32) console.warn("Expected 32 teeth, got", items.length);

  items.sort((a, b) => a.c.y - b.c.y);
  const lower = orderArch(items.slice(0, 16));
  const upper = orderArch(items.slice(16));

  const teeth: Tooth[] = [];
  upper.forEach((t, i) =>
    teeth.push({
      id: i + 1,
      arch: "upper",
      quadrant: i < 8 ? 1 : 2,
      type: TYPE_BY_INDEX[i],
      mesh: t.mesh,
      center: t.c,
    })
  );
  lower.forEach((t, i) =>
    teeth.push({
      id: 32 - i,
      arch: "lower",
      quadrant: i < 8 ? 4 : 3,
      type: TYPE_BY_INDEX[i],
      mesh: t.mesh,
      center: t.c,
    })
  );

  return teeth.sort((a, b) => a.id - b.id);
}
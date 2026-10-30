import * as THREE from "three";

export type Arch = "upper" | "lower";
export type ToothType = "incisor" | "canine" | "premolar" | "molar" | "gum";

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
  if (dot < 0) seq.reverse(); // index 0 must sit on the patient's right

  return seq;
}


function splitGums(gum: THREE.Mesh, teeth: Tooth[]): THREE.Mesh[] {
  const geo = gum.geometry as THREE.BufferGeometry;
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const uv = geo.getAttribute("uv");
  const index = geo.index;
  const triCount = (index ? index.count : pos.count) / 3;

  const upper = teeth.filter((t) => t.arch === "upper");
  const lower = teeth.filter((t) => t.arch === "lower");
  const avgY = (list: Tooth[]) =>
    list.reduce((s, t) => s + t.center.y, 0) / list.length;
  const midY = (avgY(upper) + avgY(lower)) / 2;

  const P: number[][] = [[], [], [], []];
  const N: number[][] = [[], [], [], []];
  const U: number[][] = [[], [], [], []];
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let i = 0; i < triCount; i++) {
    const ids = [0, 1, 2].map((k) => (index ? index.getX(i * 3 + k) : i * 3 + k));

    // triangle centre in world space
    c.set(0, 0, 0);
    ids.forEach((id) => c.add(v.fromBufferAttribute(pos, id)));
    c.divideScalar(3).applyMatrix4(gum.matrixWorld);

    // upper or lower by height, quadrant by the nearest tooth in that arch
    const arch = c.y > midY ? upper : lower;
    let best = arch[0];
    let bestD = Infinity;
    arch.forEach((t) => {
      const dx = t.center.x - c.x;
      const dz = t.center.z - c.z;
      const d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    });

    const q = best.quadrant - 1;
    ids.forEach((id) => {
      P[q].push(pos.getX(id), pos.getY(id), pos.getZ(id));
      if (nor) N[q].push(nor.getX(id), nor.getY(id), nor.getZ(id));
      if (uv) U[q].push(uv.getX(id), uv.getY(id));
    });
  }

  const meshes = P.map((p, i) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    if (nor) g.setAttribute("normal", new THREE.Float32BufferAttribute(N[i], 3));
    if (uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(U[i], 2));

    const mesh = new THREE.Mesh(g, gum.material);
    mesh.name = `gum-${i + 1}`;
    mesh.position.copy(gum.position);
    mesh.quaternion.copy(gum.quaternion);
    mesh.scale.copy(gum.scale);
    gum.parent?.add(mesh);
    mesh.updateWorldMatrix(true, false);
    return mesh;
  });

  gum.visible = false;
  gum.raycast = () => {};
  return meshes;
}




export function buildRegistry(root: THREE.Object3D): Tooth[] {
  root.updateWorldMatrix(true, true);

  const items: Item[] = [];
  const gums: THREE.Mesh[] = [];
  const regions: THREE.Mesh[] = [];

  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (m.name.startsWith("gum-")) regions.push(m);
    else if (m.name.startsWith("Box002_01")) gums.push(m);
    else {
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
      items.push({ mesh: m, c });
    }
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

  // gum regions: IDs 33-36 = quadrants 1-4 (reuse them if already split)
  if (gums[0]) {
    const meshes = regions.length === 4 ? regions : splitGums(gums[0], teeth);
    meshes.forEach((mesh) => {
      const q = Number(mesh.name.slice(4)) as 1 | 2 | 3 | 4;
      teeth.push({
        id: 32 + q,
        arch: q <= 2 ? "upper" : "lower",
        quadrant: q,
        type: "gum",
        mesh,
        center: new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()),
      });
    });
  }

  return teeth.sort((a, b) => a.id - b.id);
}
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three"
import { TeethModel } from "./models/Teeth";
import { buildRegistry } from "../data/toothRegistry";
// import { useSetAtom } from "jotai";
// import { registryAtom } from "../state/atoms";
import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { hoveredToothAtom, registryAtom, toggleToothAtom } from "../state/atoms";
import TeethGlow from "./TeethGlow";


const TARGET_WIDTH = 6

export default function Teeth(){
  const ref = useRef<THREE.Group>(null);
  const setRegistry = useSetAtom(registryAtom)
  const registry = useAtomValue(registryAtom);
const setHovered = useSetAtom(hoveredToothAtom);
const toggle = useSetAtom(toggleToothAtom);
const idByUuid = useMemo(
  () => new Map(registry.map((t) => [t.mesh.uuid, t.id])),
  [registry]
);



    useLayoutEffect(()=>{
      const g = ref.current;
      if (!g) return;
      g.position.set(0, 0, 0);
      g.rotation.set(0, Math.PI, 0);
      g.scale.setScalar(1);
      g.updateWorldMatrix(true, true)

            const box = new THREE.Box3().setFromObject(g);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const s = TARGET_WIDTH / Math.max(size.x, size.z);

      g.scale.setScalar(s)
      g.position.set(-center.x * s, -center.y * s, -center.z * s)

      // console.log("teeth size", size, "scale")

      const teeth = buildRegistry(g);
      setRegistry(teeth);

      teeth.forEach((t) => {
  t.mesh.material = (t.mesh.material as THREE.MeshStandardMaterial).clone();
});
      // console.table(
      //   teeth.map((t) => ({id: t.id, arch: t.arch, q: t.quadrant, type: t.type, node: t.mesh.name}))
      // );
      // teeth.forEach((t) => {
      //   const m = (t.mesh.material as THREE.MeshStandardMaterial).clone();
      //   m.color.setHSL(t.id / 32, 0.7, 0.6);
      //   t.mesh.material = m
      // })
    }, [setRegistry])



  return (
  <group
    ref={ref}
    onPointerOver={(e) => {
      const id = idByUuid.get(e.object.uuid);
      if (id === undefined) return;
      e.stopPropagation();
      setHovered(id);
      // document.body.style.cursor = "pointer";
    }}
    onPointerOut={(e) => {
      const id = idByUuid.get(e.object.uuid);
      if (id === undefined) return;
      e.stopPropagation();
      setHovered(null);
      // document.body.style.cursor = "auto";
    }}
    onClick={(e) => {
      if (e.delta > 4) return;
      const id = idByUuid.get(e.object.uuid);
      if (id === undefined) return;
      e.stopPropagation();
      toggle(id);
    }}
  >
    <TeethModel />
    <TeethGlow />
  </group>
);
}
import { useEffect } from "react";
import * as THREE from "three";
import { useAtomValue } from "jotai";
import {
  hoveredToothAtom,
  registryAtom,
  selectedTeethAtom,
} from "../state/atoms";
import { useThree } from "@react-three/fiber";


const HOVER = new THREE.Color("#ffd36b");
const SELECTED = new THREE.Color("#ff5a00");

export default function TeethGlow() {
  const registry = useAtomValue(registryAtom);
  const hovered = useAtomValue(hoveredToothAtom);
  const selected = useAtomValue(selectedTeethAtom);

  const gl = useThree((s) => s.gl);

  useEffect(() =>{
    gl.domElement.style.cursor = hovered !== null ? " pointer" : "auto";
    return() =>{
        gl.domElement.style.cursor = "auto"
    };
  }, [hovered, gl])

  useEffect(() => {
    registry.forEach((t) => {
      const m = t.mesh.material as THREE.MeshStandardMaterial;
      if (selected.has(t.id)) {
        m.emissive.copy(SELECTED);
        m.emissiveIntensity = 2;
      } else if (t.id === hovered) {
        m.emissive.copy(HOVER);
        m.emissiveIntensity = 0.85;
      } else {
        m.emissive.set("#000000");
        m.emissiveIntensity = 0;
      }
    });
  }, [registry, hovered, selected]);

  return null;
}
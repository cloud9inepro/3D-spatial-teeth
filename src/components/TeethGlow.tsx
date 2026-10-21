import { useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import {
  hoveredToothAtom,
  registryAtom,
  selectedTeethAtom,
  severityAtom,
} from "../state/atoms";
import { tierOf, type Tier } from "../data/severity";

const HOVER = new THREE.Color("#ffd36b");
const UNSET = new THREE.Color("#7dd3fc");

const TIER_GLOW: Record<
  Tier,
  { color: THREE.Color; base: number; amp: number; speed: number }
> = {
  mild: { color: new THREE.Color("#facc15"), base: 1.2, amp: 0, speed: 0 },
  moderate: { color: new THREE.Color("#fb923c"), base: 1.4, amp: 0.3, speed: 2 },
  severe: { color: new THREE.Color("#ef4444"), base: 1.8, amp: 0.7, speed: 5 },
};

function useReducedMotion() {
  const [reduce, setReduce] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

export default function TeethGlow() {
  const registry = useAtomValue(registryAtom);
  const hovered = useAtomValue(hoveredToothAtom);
  const selected = useAtomValue(selectedTeethAtom);
  const severity = useAtomValue(severityAtom);
  const reduce = useReducedMotion();
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const canvas = get().gl.domElement;
    canvas.style.cursor = hovered !== null ? "pointer" : "auto";
    return () => {
      canvas.style.cursor = "auto";
    };
  }, [hovered, get]);

  useEffect(() => {
    registry.forEach((t) => {
      const m = t.mesh.material as THREE.MeshStandardMaterial;
      if (selected.has(t.id)) {
        const v = severity.get(t.id);
        if (v === undefined) {
          m.emissive.copy(UNSET);
          m.emissiveIntensity = 1;
        } else {
          const g = TIER_GLOW[tierOf(v)];
          m.emissive.copy(g.color);
          m.emissiveIntensity = g.base;
        }
      } else if (t.id === hovered) {
        m.emissive.copy(HOVER);
        m.emissiveIntensity = 0.85;
      } else {
        m.emissive.set("#000000");
        m.emissiveIntensity = 0;
      }
    });
    invalidate();
  }, [registry, hovered, selected, severity, invalidate]);

  useFrame(({ clock }) => {
    if (reduce) return;
    const time = clock.elapsedTime;
    registry.forEach((t) => {
      if (!selected.has(t.id)) return;
      const v = severity.get(t.id);
      if (v === undefined) return;
      const g = TIER_GLOW[tierOf(v)];
      if (g.amp === 0) return;
      const m = t.mesh.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = g.base + g.amp * Math.sin(time * g.speed);
    });
  });

  return null;
}
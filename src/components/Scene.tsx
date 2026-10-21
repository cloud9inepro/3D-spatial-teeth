
import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import Teeth from "./FittedTeeth"

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    // wider FOV on portrait so the arch isn't cropped
    (camera as THREE.PerspectiveCamera).fov = aspect < 1 ? 50 : 35;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(2);
  const [reduceMotion, setReduceMotion] = useState(false);
    
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    
    <Canvas
      dpr={[1, dpr]}
      frameloop={reduceMotion ? "demand" : "always"}
      shadows={false}
      camera={{ position: [0, 2, 10], fov: 35, near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      style={{ touchAction: "none" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(2)}
      />
      <ResponsiveCamera />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
      <ambientLight 
        intensity={0.6}
      />
      <directionalLight 
        position={[3, 5, 6]}
        intensity={0.6}
      />

      <Suspense fallback={null}>
        <Teeth/>
        </Suspense>        
      
      
    </Canvas>
  );
}
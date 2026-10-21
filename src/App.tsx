// import { Canvas } from "@react-three/fiber";
import { Suspense, } from "react";
import Scene from "./components/Scene";


export default function App() {
  return (
    <div className="h-[60dvh] w-full md:h-dvh md:w-2/3">
      
    <Suspense>
      <Scene/>
    </Suspense>
    </div>
  );
}

// import { Canvas } from "@react-three/fiber";
import { Suspense, } from "react";
import Scene from "./components/Scene";
import Panel from "./components/Panel";
import IntroCard from "./components/IntroCard";


export default function App() {
  return (
    <main className="flex h-dvh flex-col md:flex-row">
        <div className="relative h-[55dvh] w-full md:h-full md:w-2/3">  
    <Suspense>
      <Scene/>
      <IntroCard/>
    </Suspense>
    </div>
    <Panel/>
    </main>
    
  );
}

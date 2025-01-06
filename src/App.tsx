import { useEffect, useRef, useState } from "react"
import { HUD } from "./hud/hud";

function SceneView() {
  const [view] = useState(() => null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // view.container = ref.current;
  }, [view])

  return <div className="bg-red-500 w-full h-full" ref={ref} />
}



function App() {
  return (
    <>
      <div className="absolute inset-0">
        <SceneView />
      </div>
      <div className="py-8 px-32 flex flex-col flex-1 justify-end">
        <HUD />
      </div>
    </>
  )
}

export default App

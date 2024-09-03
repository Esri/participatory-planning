import { HUD } from "./hud/hud";
import { SceneView } from "./arcgis/components/scene-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useLayoutEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Scene } from "./scene/scene";

function useRedirectToHashRoot() {
  const navigate = useNavigate();
  const [, setParams] = useSearchParams()
  useLayoutEffect(() => {
    let frame = -1;
    function loop() {
      frame = requestAnimationFrame(() => {
        if (window.location.hash === "") {
          navigate("/");
          if (window.location.search) {
            const search = window.location.search;
            setParams(search);
            window.location.search = ""
          }
          loop()
        }
      })
    }
    loop()
    return () => cancelAnimationFrame(frame);
  });
}

function App() {
  const [queryClient] = useState(() => new QueryClient());

  useRedirectToHashRoot();


  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <Scene>
          <div className="absolute inset-0">
            <SceneView />
          </div>
          <div className="py-8 px-32 flex flex-col flex-1">
            <HUD />
          </div>
        </Scene>
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
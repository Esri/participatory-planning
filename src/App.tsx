import { HUD } from "./hud/hud";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scene, View } from "./scene/scene";
import { createPortal } from "react-dom";
import { SceneSettingsProvider } from "./scene/scene-store";
import { EditorProvider } from "./editor/editor";

function useRedirectToHashRoot() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    let frame = -1;
    function loop() {
      frame = requestAnimationFrame(() => {
        if (window.location.hash === "") {
          navigate({
            pathname: '/',
            search: window.location.search
          });

          window.location.search = ""
          loop();
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
        <SceneSettingsProvider>
          <Scene>
            <div className="absolute inset-0">
              <View>
                <RootOverlayPortal>
                  <div className="py-8 px-32 flex flex-col flex-1 pointer-events-none">
                    <EditorProvider>
                      <HUD />
                    </EditorProvider>
                  </div>
                </RootOverlayPortal>
              </View>
            </div>
            <div id="root-overlay" className="contents" />
          </Scene>
        </SceneSettingsProvider>
      </Suspense>
    </QueryClientProvider>
  )
}

export default App

function RootOverlayPortal({ children }: PropsWithChildren) {
  const [rootOverlayElement, setElement] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setElement(document.getElementById("root-overlay"));
  }, [])

  if (rootOverlayElement == null) return null;

  return createPortal(children, rootOverlayElement)
}
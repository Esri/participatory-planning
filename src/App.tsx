/* Copyright 2024 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
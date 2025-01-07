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

import { createContext, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState } from "react"
import ArcgisWebScene from '@arcgis/core/WebScene';
import PortalItem from '@arcgis/core/portal/PortalItem';

export function WebScene(props: PropsWithChildren<{
  websceneId: string;
}>) {
  const [map] = useState(() => new ArcgisWebScene());

  useLayoutEffect(() => {
    map.portalItem = new PortalItem({ id: props.websceneId })
  }, [map, props.websceneId])

  return (
    <WebSceneProvider scene={map}>
      {props.children}
    </WebSceneProvider>
  )
}

export function useWebScene() {
  return useContext(WebSceneContext);
}

const WebSceneContext = createContext<ArcgisWebScene>(null!);

function WebSceneProvider({ scene, children }: PropsWithChildren<{ scene: ArcgisWebScene }>) {
  useEffect(() => {
    scene.portalItem.load();
  }, [scene])

  return (
    <WebSceneContext.Provider value={scene}>
      {children}
    </WebSceneContext.Provider>
  )
}
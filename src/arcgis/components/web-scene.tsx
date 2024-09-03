import { createContext, PropsWithChildren, useContext, useLayoutEffect, useState } from "react"
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
  return (
    <WebSceneContext.Provider value={scene}>
      {children}
    </WebSceneContext.Provider>
  )
}
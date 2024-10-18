import { createContext, forwardRef, PropsWithChildren, useContext, useEffect, useState } from "react"
import ArcgisSceneView from '@arcgis/core/views/SceneView';

import '@arcgis/core/assets/esri/themes/dark/main.css'
import { useWebScene } from "./web-scene";

export const SceneView = forwardRef<ArcgisSceneView, PropsWithChildren>(function SceneView(props, ref) {
  const [view] = useState(() => new ArcgisSceneView({
    popupEnabled: false
  }));
  const scene = useWebScene();

  useEffect(() => {
    view.map = scene!;
  }, [scene, view]);

  return (
    <SceneViewProvider view={view}>
      <div
        ref={node => {
          if (node) view.container = node
          if (ref && typeof ref === 'function') ref(view);
          else if (ref) ref.current = view;
        }}
        className="w-full h-full"
      />
      {props.children}
    </SceneViewProvider>
  )
})

const SceneViewContext = createContext<ArcgisSceneView>(null!);

function SceneViewProvider({ view, children }: PropsWithChildren<{ view: ArcgisSceneView }>) {
  return (
    <SceneViewContext.Provider value={view}>
      {children}
    </SceneViewContext.Provider>
  )
}

export function useSceneView() {
  return useContext(SceneViewContext);
}
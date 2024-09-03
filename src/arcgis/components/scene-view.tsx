import { useEffect, useState } from "react"
import ArcgisSceneView from '@arcgis/core/views/SceneView';

import '@arcgis/core/assets/esri/themes/dark/main.css'
import { useWebScene } from "./web-scene";

export function SceneView() {
  const [view] = useState(() => new ArcgisSceneView());
  const scene = useWebScene();

  useEffect(() => {
    view.map = scene!;
  }, [scene, view])

  return (
    <div
      ref={node => { if (node) view.container = node }}
      className="w-full h-full"
    />
  )
}
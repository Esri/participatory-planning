import { useLayoutEffect, useState } from "react";
import ArcgisVectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import { useWebScene } from "./web-scene";
import PortalItem from "@arcgis/core/portal/PortalItem";

export function VectorTileLayer(props: {
  itemId: string;
  hidden?: boolean
}) {
  const scene = useWebScene();
  const [layer] = useState(() => new ArcgisVectorTileLayer());

  useLayoutEffect(() => {
    layer.visible = !props.hidden;
    if (layer.portalItem?.id !== props.itemId)
      layer.portalItem = new PortalItem({
        id: props.itemId
      })
  }, [layer, props.hidden, props.itemId])

  useLayoutEffect(() => {
    scene.layers.add(layer);
    return () => {
      scene.layers.remove(layer);
    }
  }, [layer, scene.layers])

  return null;
}
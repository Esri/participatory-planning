import { createContext, PropsWithChildren, useContext, useLayoutEffect, useState } from "react";
import ArcgisGraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { useWebScene } from "./web-scene";
import ArcgisGraphic from "@arcgis/core/Graphic";
import ArcgisSymbol from "@arcgis/core/symbols/Symbol";
import ArcgisGeometry from "@arcgis/core/geometry/Geometry";

export function GraphicsLayer(props: PropsWithChildren<{
  hidden?: boolean;
  elevationMode?: ArcgisGraphicsLayer['elevationInfo']['mode']
}>) {
  const scene = useWebScene();
  const [layer] = useState(() => new ArcgisGraphicsLayer());

  useLayoutEffect(() => {
    layer.visible = !props.hidden;

    const elevationMode = props.elevationMode ?? "absolute-height";
    layer.elevationInfo ??= { mode: elevationMode }
    layer.elevationInfo.mode = elevationMode;
  }, [layer, props.elevationMode, props.hidden])

  useLayoutEffect(() => {
    scene.layers.add(layer);
    return () => {
      scene.layers.remove(layer);
    }
  }, [layer, scene.layers])

  return (
    <GraphicsContext.Provider value={layer}>
      {props.children}
    </GraphicsContext.Provider>
  );
}

const GraphicsContext = createContext<ArcgisGraphicsLayer | undefined>(null!)

export function useGraphicsContext() {
  const layer = useContext(GraphicsContext);
  return layer;
}

export function Graphic(props: { symbol: ArcgisSymbol, geometry: ArcgisGeometry }) {
  const layer = useContext(GraphicsContext);
  const [graphic] = useState(() => new ArcgisGraphic())

  useLayoutEffect(() => {
    graphic.symbol = props.symbol;
    graphic.geometry = props.geometry;
  }, [graphic, props.geometry, props.symbol])

  useLayoutEffect(() => {
    layer?.add(graphic);
    return () => {
      layer?.remove(graphic);
    }
  })

  return null;
}
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

import { createContext, forwardRef, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState } from "react";
import ArcgisGraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { useWebScene } from "./web-scene";
import ArcgisGraphic from "@arcgis/core/Graphic";
import ArcgisSymbol from "@arcgis/core/symbols/Symbol";
import ArcgisGeometry from "@arcgis/core/geometry/Geometry";
import { useEditor } from "../../editor/editor";

type GraphicsLayerProps = PropsWithChildren<{
  hidden?: boolean;
  elevationMode?: ArcgisGraphicsLayer['elevationInfo']['mode']
}>
export const GraphicsLayer = forwardRef<ArcgisGraphicsLayer, GraphicsLayerProps>(function GraphicsLayer(props, ref) {
  const scene = useWebScene();
  const [layer] = useState(() => new ArcgisGraphicsLayer());

  useLayoutEffect(() => {
    layer.visible = !props.hidden;

    const elevationMode = props.elevationMode ?? "absolute-height";
    layer.elevationInfo ??= { mode: elevationMode }
    layer.elevationInfo.mode = elevationMode;

    if (elevationMode === 'relative-to-scene') layer.title = 'points'
    if (elevationMode !== 'relative-to-scene') layer.title = 'shapes'
  }, [layer, props.elevationMode, props.hidden])

  useLayoutEffect(() => {
    scene.layers.add(layer);
    return () => {
      scene.layers.remove(layer);
    }
  }, [layer, scene.layers])

  useEffect(() => {
    if (ref == null) return;

    if (typeof ref === 'function') ref(layer);
    else ref.current = layer;
  }, [layer, ref]);

  // ==== //
  const editor = useEditor();
  useEffect(() => {
    if (editor != null) {
      editor.layers.add(layer);

      return () => {
        editor.layers.remove(layer);
      }
    }
  }, [editor, editor?.layers, layer])
  // ==== //

  return (
    <GraphicsContext.Provider value={layer}>
      {props.children}
    </GraphicsContext.Provider>
  );
})

const GraphicsContext = createContext<ArcgisGraphicsLayer>(null!)

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
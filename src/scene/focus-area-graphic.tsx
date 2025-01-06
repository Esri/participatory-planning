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

import { animate, useMotionValueEvent, useSpring } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import { useGraphicsContext } from "../arcgis/components/graphics-layer";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Polygon from "@arcgis/core/geometry/Polygon";
import FillSymbol3DLayer from '@arcgis/core/symbols/FillSymbol3DLayer';
import PolygonSymbol3D from '@arcgis/core/symbols/PolygonSymbol3D';
import Color from '@arcgis/core/Color';

function createMaskSymbol(opacity: number) {
  return new PolygonSymbol3D({
    symbolLayers: [
      new FillSymbol3DLayer({
        material: {
          color: new Color({ r: 0, g: 0, b: 0, a: opacity }),
        },
      })
    ]
  })
}
export function FocusAreaGraphic({
  surface,
  isActive,
}: {
  surface: Array<[x: number, y: number]>;
  isActive: boolean
}) {

  const focusPolygon = useMemo(() => {
    const surfacePolygon = new Polygon({
      rings: [surface.map(coord => [coord[0], coord[1], 0])],
      spatialReference: SpatialReference.WebMercator
    })
    const buffer = geometryEngine.buffer(surfacePolygon, 200, 'kilometers') as Polygon;
    return geometryEngine.difference(buffer.extent, surfacePolygon) as Polygon
  }, [surface]);

  const [graphic] = useState(() => new Graphic({
    geometry: focusPolygon,
    symbol: createMaskSymbol(0),
  }))

  const opacity = useSpring(0, { bounce: 0, duration: 2 });

  useMotionValueEvent(opacity, "change", (latest) => {
    graphic.symbol = createMaskSymbol(latest);
  });

  useEffect(() => {
    if (isActive) {
      animate(opacity, 0.3, { duration: 2 })
    } else {
      animate(opacity, 0, { duration: 2 })
    }
  }, [isActive, opacity])

  useLayoutEffect(() => {
    graphic.geometry = focusPolygon;
  }, [focusPolygon, graphic])

  const layer = useGraphicsContext();

  useLayoutEffect(() => {
    layer?.add(graphic);

    return () => layer?.remove(graphic);
  }, [graphic, layer]);

  return null;
}

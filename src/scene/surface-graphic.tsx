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

import {
  useMotionValueEvent,
  useSpring,
  animate,
  MotionValueSegmentWithTransition,
} from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Graphic from "@arcgis/core/Graphic";
import { useGraphicsContext } from "../arcgis/components/graphics-layer";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import Color from '@arcgis/core/Color';

function createMaskSymbol(opacity: number) {
  return new SimpleFillSymbol({
    color: new Color({ r: 226, g: 119, b: 40, a: opacity }),
    outline: {
      width: 0
    }
  })
}
export function SurfaceGraphic({
  surface,
  isActive = false,
  onComplete,
}: {
  onComplete?: () => void;
  surface: Array<[x: number, y: number]>;
  isActive?: boolean;
}) {
  const surfacePolygon = useMemo(() => new Polygon({
    rings: [surface],
    spatialReference: SpatialReference.WebMercator
  }), [surface])
  const [graphic] = useState(() => new Graphic({
    geometry: surfacePolygon,
    symbol: createMaskSymbol(0),
  }))

  const opacity = useSpring(0, { bounce: 0 })

  useMotionValueEvent(opacity, "change", (latest) => {
    graphic.symbol = createMaskSymbol(latest);
  });

  const onCompleteMutable = useRef(onComplete);
  useEffect(() => {
    onCompleteMutable.current = onComplete
  })

  useEffect(() => {
    if (isActive) {
      const controls = animate([
        [opacity, 1, { duration: 0.5 }] as MotionValueSegmentWithTransition,
        [opacity, 0, { duration: 0.5 }] as MotionValueSegmentWithTransition
      ], { repeat: 2 });

      let interrupted = false;
      controls.then(() => {
        if (!interrupted) onCompleteMutable.current?.()
      })
      return () => {
        interrupted = true;
        controls.cancel()
      }
    }
  }, [isActive, opacity])

  const layer = useGraphicsContext();

  useLayoutEffect(() => {
    layer?.add(graphic);

    return () => layer?.remove(graphic);
  }, [graphic, layer]);



  return null;
}

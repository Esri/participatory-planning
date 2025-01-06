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
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  animate,
  MotionValueSegmentWithTransition,
  cubicBezier
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Polyline from "@arcgis/core/geometry/Polyline";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Line3DSymbol from "@arcgis/core/symbols/LineSymbol3D";
import LineSymbolLayer3D from "@arcgis/core/symbols/LineSymbol3DLayer";
import Graphic from "@arcgis/core/Graphic";
import { useGraphicsContext } from "../arcgis/components/graphics-layer";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import LineSymbol3D from "@arcgis/core/symbols/LineSymbol3D";
import Color from "@arcgis/core/Color";

const maskColor = [226, 119, 40];
const LineSymbol = new Line3DSymbol({
  symbolLayers: [
    new LineSymbolLayer3D({
      size: 6,
      material: { color: maskColor },
    }),
  ],
});
const EMPTY_POLYLINE = new Polyline({
  paths: [
    [
      [0, 0],
      [1, 1],
    ],
  ],
  spatialReference: SpatialReference.WebMercator,
});

export function PerimeterGraphic({
  perimeter,
  onComplete,
  isActive
}: {
  perimeter: Array<[x: number, y: number]>;
  onComplete?: () => void;
  isActive: boolean;
}) {
  const [graphic] = useState(
    () =>
      new Graphic({
        geometry: EMPTY_POLYLINE,
        symbol: LineSymbol,
      })
  );

  const [drawPathSequence, lineSegment] = usePolylineDrawSequence(perimeter, (line) => { graphic.geometry = line });

  const opacity = useSpring(0, { bounce: 0 });
  const updateOpacity = useCallback((opacity: number) => {
    if (opacity === 1) {
      graphic.symbol = LineSymbol;
    } else {
      graphic.symbol = new LineSymbol3D({
        symbolLayers: [
          new LineSymbolLayer3D({
            size: 6,
            material: { color: new Color([...maskColor, opacity]) }
          })
        ]
      })
    }
  }, [graphic])

  const onCompleteMutable = useRef(onComplete);
  useEffect(() => {
    onCompleteMutable.current = onComplete
  })

  const activeControl = useRef<ReturnType<typeof animate>>();
  useEffect(() => {
    if (isActive) {
      animate(opacity, 1, {
        duration: 0.3,
        onUpdate: updateOpacity
      })

      const control = animate(drawPathSequence);
      control.then(() => {
        if (activeControl.current === control)
          onCompleteMutable.current?.()
      })

      activeControl.current = control;
    } else {
      const control = animate(opacity, 0, {
        duration: 0.3,
        onUpdate: updateOpacity
      })

      control.then(() => {
        if (activeControl.current === control)
          lineSegment.jump(0);
      });

      activeControl.current = control;
    }
  }, [drawPathSequence, isActive, lineSegment, opacity, updateOpacity])

  const layer = useGraphicsContext();

  useLayoutEffect(() => {
    layer?.add(graphic);

    return () => layer?.remove(graphic);
  }, [graphic, layer]);

  return null;
}

function usePolylineDrawSequence(line: Array<[x: number, y: number]>, onUpdate: (line: Polyline) => void) {
  const lineSegment = useMotionValue(0);

  const loops = line.at(0)?.[0] === line.at(-1)?.[0] && line.at(0)?.[1] === line.at(-1)?.[1]
  const numberOfSegments = loops ? line.length : line.length + 1;

  const segments = Array.from({ length: numberOfSegments }).map((_, i) => i);
  const xs = segments.map((i) => line[i % line.length][0]);
  const ys = segments.map((i) => line[i % line.length][1]);

  const transformX = useTransform(lineSegment, segments, xs);
  const transformY = useTransform(lineSegment, segments, ys);

  useMotionValueEvent(lineSegment, "change", (lineSegmentInterpolation) => {
    const nextSegmentIndex = Math.ceil(lineSegmentInterpolation);

    let path;
    if (lineSegmentInterpolation === 0) {
      // if we're at 0, there is nothing to show, so we just draw an empty polyline
      path = EMPTY_POLYLINE.paths[0];
    } else {
      const vertexes = nextSegmentIndex;
      path = line.slice(0, vertexes);

      path.push([transformX.get(), transformY.get()]);
    }

    const polyline = EMPTY_POLYLINE?.clone() as Polyline;
    polyline.paths = [path];

    /*
      adding a vertex to the line can cause some popping and shifting in the rendered graphic between neighboring vertices.

      densifying the line ensures that the distance between vertices is never big enough for the popping to become noticeable
    */
    const densifiedPath = geometryEngine.densify(polyline, 10, 'meters') as Polyline;

    onUpdate(densifiedPath);
  });

  const drawPathSequence = useMemo(() => {
    const steps = Array.from({ length: line.length + 1 }).map((_, i) => i);
    const totalDistance = line.reduce((total, current, index) => distance(current, line.at(index - 1)!) + total, 0);
    const transitions = steps.map((_, i) => {
      const previous = line.at(i - 1)!;
      const next = line.at(i % (line.length - 1))!;

      const a = previous[0] - next[0];
      const b = previous[1] - next[1]
      const distance = Math.sqrt(a * a + b * b);

      const transition: MotionValueSegmentWithTransition[2] = {
        duration: (distance / totalDistance) * 2,
        ease: cubicBezier(0.32, 0.23, 0.4, 0.9)
      };
      return transition;
    });

    return transitions.map((transition, i) => [lineSegment, i, transition] as MotionValueSegmentWithTransition)
  }, [lineSegment, line])

  return [drawPathSequence, lineSegment] as const;
}

function distance(p: [x: number, y: number], q: [x: number, y: number]) {
  const a = p[0] - q[0];
  const b = p[1] - q[1];

  return Math.sqrt(a * a + b * b)

}
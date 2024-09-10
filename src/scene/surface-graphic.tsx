import {
  useMotionValueEvent,
  useSpring,
  animate,
  MotionValueSegmentWithTransition,
} from "framer-motion";
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

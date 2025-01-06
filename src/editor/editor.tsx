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

import Mesh from "@arcgis/core/geometry/Mesh";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useSceneView } from "../arcgis/components/scene-view";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import Collection from "@arcgis/core/core/Collection";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryOptions } from "../scene/settings";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { Symbol, Symbol3D, WaterSymbol3DLayer } from "@arcgis/core/symbols";

@subclass()
class Editor extends Accessor {
  @property()
  view?: SceneView;

  @property()
  activeOperation: Operation | null = null;

  @property()
  get isActive() {
    return this.activeOperation != null;
  }

  @property()
  onComplete?: (result: Awaited<Operation['promise']>) => void;

  applyOperation = async (operation: Operation) => {
    this.activeOperation?.interrupt();

    operation.start();
    this.activeOperation = operation;

    try {
      const result = await operation.promise;
      this.activeOperation = null;
      this.onComplete?.(result);
    } catch (reason) {
      if (typeof reason === 'string' && reason === 'cancelled') {
        this.activeOperation = null;
      }
    }
  }

  @property()
  layers = new Collection<GraphicsLayer>();

  get graphics() {
    return this.layers
      .toArray()
      .flatMap(layer => layer.graphics.toArray())
  }

  initialize() {
    const handles: IHandle[] = [];

    this.addHandles([
      reactiveUtils.when(() => this.activeOperation, () => {
        this.view?.focus();
      }),
      reactiveUtils.watch(() => this.view, (view) => {
        for (const handle of handles)
          handle.remove();

        if (view == null) return;

        handles.push(view.on('click', async (event) => {
          if (this.activeOperation != null) return;

          const hitTest = await view.hitTest(event);

          const graphicResults = hitTest.results
            .filter(result => result.type === 'graphic')
            .filter(result => this.graphics.includes(result.graphic));

          // since water is always drawn on top of other graphics, we select water graphics even though they have a higher index
          const waterResult = graphicResults.find((result) =>
            (result.graphic.symbol as Symbol3D).symbolLayers?.some(symbolLayer => symbolLayer instanceof WaterSymbol3DLayer)
          )

          const result =
            waterResult ?? graphicResults
              .find(result => this.graphics.includes(result.graphic))

          if (result) {
            const operation = new Operation((complete) => {
              const graphic = result.graphic;
              const index = (graphic.layer as GraphicsLayer).graphics.indexOf(graphic);

              const sketch = createSketchViewModel({
                view,
                layer: result.graphic.layer as GraphicsLayer,
              })

              sketch.on("update", (event) => {
                if (event.state === 'complete') complete({
                  graphics: event.graphics, indexes: [index]
                });
              })

              sketch.update(graphic);
              return sketch;
            })

            this.applyOperation(operation);
          }
        }))

        handles.push(
          reactiveUtils.on(() => window, "keydown", (event: KeyboardEvent) => {
            if (this.activeOperation == null) return;

            if (event.key === 'c') {
              event.preventDefault();
              event.stopImmediatePropagation();
              this.activeOperation.complete();
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
              event.preventDefault();
              event.stopImmediatePropagation();
              this.activeOperation.delete();
            }
          })
        )
      })
    ])
  }
}

class Operation {
  promise: Promise<{ graphics: Graphic[], indexes?: number[] }>;
  cancel: () => void;
  complete: () => void = () => { };
  delete: () => void = () => { };
  interrupt: () => void;
  start: () => void;

  constructor(operate: (complete: (result: Awaited<Operation['promise']>) => void, cancel: () => void) => SketchViewModel) {
    const { promise, resolve, reject } = Promise.withResolvers<Awaited<Operation['promise']>>();
    this.promise = promise;

    this.cancel = () => reject('cancelled');
    this.interrupt = () => reject('interrupted');

    this.start = () => {
      const sketch = operate(resolve, this.cancel);
      promise.catch(() => sketch.cancel());
      promise.finally(() => sketch.destroy());
      this.complete = () => sketch.complete();
      this.delete = () => sketch.delete();
    }
  }
}

function createSketchViewModel({
  view, layer
}: {
  view: SceneView,
  layer: GraphicsLayer,
}) {
  const sketch = new SketchViewModel({
    view,
    layer,
    snappingOptions: {
      enabled: true,
      featureSources: view.map.layers.filter(layer => layer.type === 'graphics').map((layer) => ({
        enabled: true,
        layer: layer as GraphicsLayer
      }))
    }
  });

  return sketch;
}

function createPoint({
  view, layer, symbol, boundary
}: {
  view: SceneView,
  layer: GraphicsLayer,
  symbol: SketchViewModel['pointSymbol'],
  boundary?: Polygon,
}) {
  const operation = new Operation((complete, cancel) => {
    const sketch = createSketchViewModel({
      view,
      layer,
    });

    sketch.addHandles([
      reactiveUtils.watch(() => sketch.createGraphic?.geometry as Point, (position, old) => {
        // important to prevent an infinite loop
        if (position?.equals(old)) return;

        if (position != null && boundary != null) {
          const containedPosition = geometryEngine.nearestCoordinate(boundary, position);
          sketch.createGraphic.geometry = containedPosition.coordinate;
        }
      })
    ])

    sketch.on("create", (event) => {
      if (event.state === 'complete') complete({ graphics: [event.graphic] });
      if (event.state === 'cancel') cancel();
    })

    sketch.pointSymbol = symbol;

    sketch.create('point');

    return sketch;
  })

  return operation;
}

function createPolygon({
  view, layer, symbol
}: {
  view: SceneView,
  layer: GraphicsLayer,
  symbol: SketchViewModel['polygonSymbol'],
}) {
  const operation = new Operation((complete, cancel) => {
    const sketch = createSketchViewModel({
      view,
      layer,
    });

    sketch.on("create", (event) => {
      if (event.state === 'complete') complete({ graphics: [event.graphic] });
      if (event.state === 'cancel') cancel();
    })

    sketch.polygonSymbol = symbol;

    sketch.create('polygon');

    return sketch;
  })

  return operation;
}

function createPolyline({
  view, layer, symbol
}: {
  view: SceneView,
  layer: GraphicsLayer,
  symbol: SketchViewModel['polylineSymbol'],
}) {
  const operation = new Operation((complete, cancel) => {
    const sketch = createSketchViewModel({
      view,
      layer,
    });

    sketch.on("create", (event) => {
      if (event.state === 'complete') complete({ graphics: [event.graphic] });
      if (event.state === 'cancel') cancel();
    })

    sketch.polylineSymbol = symbol;

    sketch.create('polyline');

    return sketch;
  })

  return operation;
}

export function createGeometry({
  view, layer, symbol, boundary
}: {
  view: SceneView,
  layer: GraphicsLayer,
  symbol: Symbol
  boundary?: Polygon,
}) {

  switch (symbol.type) {
    case 'cim':
    case 'polygon-3d':
    case 'simple-fill': {
      return createPolygon({ view, layer, symbol })
    }
    case 'simple-marker':
    case 'text':
    case 'point-3d':
    case 'web-style':
      return createPoint({ view, layer, symbol, boundary })
    case 'simple-line':
    case 'line-3d':
      return createPolyline({ view, layer, symbol })
    default:
      throw new Error('unsupported symbol')
  }
}

export function placeMesh({
  view, layer, boundary, url
}: {
  view: SceneView,
  layer: GraphicsLayer,
  url: string,
  boundary?: Polygon,
}) {
  const operation = new Operation((complete, cancel) => {
    const sketch = createSketchViewModel({
      view,
      layer,
    });

    sketch.addHandles(
      reactiveUtils.watch(() => (sketch.createGraphic?.geometry as Mesh)?.origin, (position) => {
        if (position != null && boundary != null) {
          const mesh = sketch.createGraphic.geometry as Mesh;
          const containedPosition = geometryEngine.nearestCoordinate(boundary, position);
          mesh.centerAt(containedPosition.coordinate);
        }
      }, { sync: true })
    )

    sketch.on("create", (event) => {
      if (event.state === 'complete') complete({ graphics: [event.graphic] });
      if (event.state === 'cancel') cancel();
    })

    document.body.style.cursor = 'wait';

    Mesh.createFromGLTF(view.center, url)
      .then((mesh) => {
        sketch.place(mesh);
      })
      .catch(cancel)
      .finally(() => {
        document.body.style.cursor = '';
      });

    return sketch;
  })

  return operation;
}

const EditorContext = createContext<Editor>(null!)

export function EditorProvider(props: PropsWithChildren) {
  const view = useSceneView();
  const [editor] = useState(() => new Editor());
  const { data: settings } = useQuery(useSettingsQueryOptions());

  useEffect(() => {
    editor.onComplete = splitAndOrderGraphics;
    editor.view = view;
  })

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  )

  /* ===== utilities ===== */
  function splitAndOrderGraphic(graphic: Graphic, providedIndex?: number) {
    const polygon = new Polygon({
      rings: [settings!.planningArea],
      spatialReference: SpatialReference.WebMercator
    })

    const layer = graphic.layer as GraphicsLayer;
    const geometry = graphic.geometry;
    const intersection = geometryEngine.intersect(polygon, geometry) as typeof geometry;
    const index = providedIndex ?? (graphic.layer as GraphicsLayer).graphics.indexOf(graphic)
    if (intersection != null) {
      graphic.geometry = intersection;

      const parts = splitGraphic(graphic);
      const graphicsAfter = layer.graphics.slice(index, -1).toArray();

      layer.remove(graphic);
      layer.removeMany(graphicsAfter);

      layer.graphics.addMany(parts, index)
      layer.graphics.addMany(graphicsAfter.map((g) => Graphic.fromJSON(g.toJSON())))
    } else {
      layer.remove(graphic);
    }
  }

  function splitAndOrderGraphics(result: Awaited<Operation['promise']>) {
    if (settings?.planningArea == null) return;

    const graphics = result.graphics;
    const indexes = result.indexes ?? [];

    const splitAndOrderedGraphics = Object.entries(graphics).flatMap(([i, graphic]) => {
      const index = indexes[+i];
      splitAndOrderGraphic(graphic, index);
    })

    return splitAndOrderedGraphics;
  }
}

export function useEditor() {
  return useContext(EditorContext);
}

function splitPolygon(polygon: Polygon) {
  return polygon.rings.map(ring => {
    const clone = polygon.clone();
    clone.rings = [ring];
    return clone;
  })
}

function splitPolyline(polyline: Polyline) {
  return polyline.paths.map(path => {
    const clone = polyline.clone();
    clone.paths = [path];
    return clone;
  })
}

function splitGraphic(graphic: Graphic) {
  switch (graphic.geometry.type) {
    case 'polygon':
      return splitPolygon(graphic.geometry as Polygon)
        .map(ring => {
          const clone = graphic.clone();
          clone.geometry = ring;
          return clone;
        });
    case 'polyline':
      return splitPolyline(graphic.geometry as Polyline)
        .map(path => {
          const clone = graphic.clone();
          clone.geometry = path;
          return clone;
        });
    default:
      return [graphic]
  }
}

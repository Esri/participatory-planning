import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { useEffect, useState } from "react";
import { useGraphicsContext } from "../arcgis/components/graphics-layer";
import Symbol from "@arcgis/core/symbols/Symbol";
import { useSceneView } from "../arcgis/components/scene-view";
import { Editor, useEditor } from "./editor";

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

export function splitGraphic(graphic: Graphic) {
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

function getToolTypeFromSymbol(symbol?: Symbol | null) {
  if (symbol == null) return;

  const isPoint = symbol.type === 'simple-marker' || symbol.type === 'web-style' || symbol.type === 'point-3d';
  const isPolyline = symbol.type === 'simple-line' || symbol.type === 'line-3d';
  const isPolygon = symbol.type === 'simple-fill' || symbol.type === 'polygon-3d';

  if (isPoint) {
    return 'point'
  }

  if (isPolyline) {
    return 'polyline'
  }

  if (isPolygon) {
    return 'polygon'
  }
}

@subclass()
export class DrawingTool extends Accessor {
  @property({ constructOnly: true })
  name!: string;

  @property()
  editor: Editor | null = null;

  @property()
  layer: SketchViewModel['layer'] | null = null;

  @property()
  view: SketchViewModel['view'] | null = null;

  @property()
  symbol: Symbol | null = null;

  async create(options?: __esri.SketchViewModelCreateCreateOptions) {
    if (this.editor == null) throw new Error('Editor not defined');
    if (this.view == null) throw new Error('View not defined');
    if (this.layer == null) throw new Error('Layer not defined');

    const symbol = this.symbol;
    const tool = getToolTypeFromSymbol(symbol);

    if (tool == null) throw new Error('Invalid symbol type');

    const { promise, resolve, reject } = Promise.withResolvers<Graphic>();
    const signal = this.editor.requestControl(this, promise);

    const sketch = new SketchViewModel({
      layer: this.layer,
      view: this.view,
    });

    switch (tool) {
      case 'point':
        sketch.pointSymbol = symbol as typeof sketch['pointSymbol'];
        break;
      case 'polygon':
        sketch.polygonSymbol = symbol as typeof sketch['polygonSymbol']
        break;
      case 'polyline':
        sketch.polylineSymbol = symbol as typeof sketch['polylineSymbol']
        break;
    }

    sketch.on('create', (event) => {
      if (event.state === 'complete') {
        (event.graphic.layer as any).remove(event.graphic);
        this.layer!.add(event.graphic);

        resolve(event.graphic);
        sketch.destroy();
      }
      if (event.state === 'cancel') {
        reject('cancelled');
        sketch.destroy();
      }
    })

    sketch.create(tool, options);
    this.view.focus();

    signal.addEventListener("abort", interrupt);
    window.addEventListener("keydown", keyboardShortcut)

    promise.finally(() => {
      window.removeEventListener("keydown", keyboardShortcut)
      signal.removeEventListener("abort", interrupt)
    })

    return promise;

    // listener functions
    function keyboardShortcut(event: KeyboardEvent) {
      if (event.key === 'c') sketch.complete();
    }

    function interrupt() {
      reject("Interrupted")
      sketch.cancel();
    }
  }
}

export function useDrawingTool(symbol: Symbol, name: string) {
  const view = useSceneView();
  const layer = useGraphicsContext();
  const editor = useEditor();

  const [tool] = useState(() => new DrawingTool({ name }));

  useEffect(() => {
    if (layer) tool.layer = layer
    else tool.layer = null;

    if (view) tool.view = view;
    else tool.view = null;

    if (editor) tool.editor = editor;
    else tool.editor = null;
  }, [editor, layer, tool, view]);

  useEffect(() => {
    tool.symbol = symbol;
  })

  return tool;
}

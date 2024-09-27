import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import { DrawingTool } from "./drawing-tool";
import { ComponentProps, createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import SceneView from "@arcgis/core/views/SceneView";
import { useSceneView } from "../arcgis/components/scene-view";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Collection from '@arcgis/core/core/Collection';
import ArcgisGraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { GraphicsLayer } from "../arcgis/components/graphics-layer";

async function handleUpdate(sketch: SketchViewModel) {
  const { promise, resolve, reject } = Promise.withResolvers<Graphic[]>();

  const onUpdateHandle = sketch.on("update", event => {
    if (event.aborted)
      return reject("cancelled");
    else if (event.state === 'complete') {
      return resolve(event.graphics);
    }
  });

  promise.finally(() => {
    onUpdateHandle.remove();
    sketch.destroy();
  })

  return promise;
}

@subclass()
export class Editor extends Accessor {
  @property()
  view: SceneView | null = null;

  @property()
  layers = new Collection<ArcgisGraphicsLayer>()

  @property()
  activeAction: Promise<Graphic> | null = null;

  @property()
  private _activeTool: [DrawingTool, AbortController] | null = null;

  @property()
  get activeTool() {
    return this._activeTool?.[0] ?? null;
  }

  @property()
  get isActive() {
    return this._activeTool != null;
  }

  onCreate?: (graphic: Graphic) => void;
  onUpdate?: (graphic: Graphic, index: number, graphics: Graphic[]) => void;

  requestControl(tool: DrawingTool, promise: Promise<Graphic>) {
    if (this._activeTool) {
      const [, controller] = this._activeTool;
      controller.abort();
    }

    const controller = new AbortController();
    this._activeTool = [tool, controller];

    promise.then(graphic => this.onCreate?.(graphic));

    promise.finally(() => {
      const [currentTool] = this._activeTool ?? [];
      if (currentTool === tool) this._activeTool = null
    })

    return controller.signal;
  }

  initialize() {
    this.addHandles([
      reactiveUtils.watch(() => this.view, (view) => {
        view?.on("click", async (event) => {
          const hits = await view.hitTest(event);

          for (const hit of hits.results) {
            if (hit.type === 'graphic' && hit.layer == null) {
              // for some reason, the point graphics end up with .layer == null, even though they are present one of the graphics layers
              // this workaround ensures the graphics layer property is updated to reflect the correct layer
              const layer = this.layers.find(layer => layer.graphics.includes(hit.graphic));
              layer.remove(hit.graphic);
              layer.add(hit.graphic);
              hit.layer = layer;
            }
          }

          const hit = hits.results.find((hit): hit is __esri.SceneViewGraphicHit => (
            hit.type === 'graphic' &&
            this.layers.includes(hit.layer as any)
          ));

          if (hit == null) return;

          const graphic = hit.graphic;
          const index = (graphic.layer as ArcgisGraphicsLayer).graphics.indexOf(graphic);
          const graphics = (graphic.layer as ArcgisGraphicsLayer).graphics.toArray();

          const sketch = new SketchViewModel({
            layer: graphic.layer,
            view,
          })

          const { promise, resolve, reject } = Promise.withResolvers<Graphic>();

          const signal = this.requestControl(
            new DrawingTool({ name: 'Update' }),
            promise
          );

          signal.addEventListener('abort', interrupt);

          sketch.on("update", (event) => {
            if (event.state === 'complete' && event.aborted) {
              return reject('Cancelled')
            }
            if (event.state === 'complete')
              return resolve(event.graphics[0]);
          })

          if (graphic.geometry.type === 'point') {
            sketch.update(graphic, { tool: 'transform', enableRotation: true, enableZ: false });
          } else {
            sketch.update(graphic, { tool: 'reshape' });
          }
          await handleUpdate(sketch);
          this.onUpdate?.(graphic, index, graphics);

          function interrupt() {
            reject('Interrupted')
            sketch.cancel();
          }
        })
      })
    ])
  }
}

const EditorContext = createContext<Editor | undefined>(null!);

export function EditorProvider(props: PropsWithChildren<{
  onCreate?: (graphic: Graphic) => void;
  onUpdate?: (graphic: Graphic, index: number, graphics: Graphic[]) => void;
}>) {
  const view = useSceneView();
  const [editor] = useState(() => new Editor());

  useEffect(() => {
    editor.onCreate = props.onCreate;
    editor.onUpdate = props.onUpdate;
    editor.view = view;
  })

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  return useContext(EditorContext);
}

export function SketchLayer(props: ComponentProps<typeof GraphicsLayer>) {
  const editor = useEditor();

  const ref = useRef<ArcgisGraphicsLayer>(null);

  useEffect(() => {
    const layer = ref.current;

    if (layer) {
      editor?.layers.add(layer);
      return () => {
        editor?.layers.remove(layer);
      }
    }
  }, [editor])

  return (
    <GraphicsLayer {...props} ref={ref} />
  )
}
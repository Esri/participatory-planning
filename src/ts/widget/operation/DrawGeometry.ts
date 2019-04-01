import "../support/extensions";

import Geometry from "esri/geometry/Geometry";
import geometryEngine from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";

import Scene from "../../Scene";
import DrawWidget from "../DrawWidget";
import WidgetOperation, { OperationHandle } from "./WidgetOperation";

export default class DrawGeometry<G extends Geometry> extends WidgetOperation {

  protected scene: Scene;

  constructor(widget: DrawWidget, public readonly graphic: Graphic, protected geometryType: string) {
    super(widget);
    this.scene = widget.app.scene;
  }

  public create(): IPromise<G> {
    return this.runSketchViewModel(true);
  }

  public update(): IPromise<G> {
    return this.runSketchViewModel(false);
  }

  protected runSketchViewModel(create: boolean): IPromise<G> {
    const haloOpacity = this.scene.view.highlightOptions.haloOpacity;
    const fillOpacity = this.scene.view.highlightOptions.fillOpacity;

    const sketchViewModel = this.createSketchViewModel();

    const keyEventListener = this.scene.view.on("key-down", (event) => {
      if (event.key === "Escape") {
        this.cancel();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        this.widget.layer.remove(this.graphic);
        this.cancel();
      }
    });

    const promise = this.initiate<G>((handle) => {

      if (create) {
        this.scene.view.highlightOptions.haloOpacity = 0;
      }
      this.scene.view.highlightOptions.fillOpacity = 0;

      sketchViewModel.on(["create", "update"], (event) => {
        this.onSketchViewModelEvent(sketchViewModel, event, handle);
      });

      this.launchSketchViewModel(sketchViewModel, create);
    }, () => {
      sketchViewModel.cancel();
    });

    // Clean up
    promise.always(() => {
      keyEventListener.remove();
      sketchViewModel.cancel();
      sketchViewModel.destroy();
      this.scene.view.highlightOptions.haloOpacity = haloOpacity;
      this.scene.view.highlightOptions.fillOpacity = fillOpacity;
    });

    return promise;
  }

  protected launchSketchViewModel(sketchViewModel: SketchViewModel, create: boolean) {
    const sketchGraphic = this.createSketch(sketchViewModel);
    if (create) {
      sketchViewModel.create(this.geometryType);
    } else {

      // Remove z value for point graphics as currently the SketchViewModel won't allow that
      const hasZ = sketchGraphic.geometry.hasZ;
      const lastGeometry = sketchGraphic.geometry.clone();
      if (hasZ) {
        sketchGraphic.geometry.hasZ = false;
      }

      sketchViewModel.update(sketchGraphic, { tool: "reshape" });

      if (hasZ) {
        sketchGraphic.geometry = lastGeometry;
      }
    }
  }

  protected onSketchViewModelEvent(sketchViewModel: SketchViewModel, event: any, handle: OperationHandle<G>) {
    const sketch = this.graphicFromEvent(event);
    // If we are done, remove extra sketch graphic
    if (event.state === "cancel" || event.state === "complete") {
      if (sketch && sketch !== this.graphic) {
        sketchViewModel.layer.remove(sketch);
      }
    }

    if (event.state === "cancel" || sketch === null) {
      handle.reject();
    } else {
      const geometry = this.geometryFromSketch(sketch);
      if (geometry) {
        this.graphic.geometry = geometry;
        this.graphic.visible = true;
      } else {
        this.graphic.visible = false;
      }

      if (!this.graphic.layer) {
        this.widget.layer.add(this.graphic);
      }

      if (event.state === "complete") {
        if (geometry) {
          handle.resolve(geometry);
        } else {
          this.widget.layer.remove(this.graphic);
          handle.reject();
        }
      }
    }
  }

  protected createSketchViewModel(): SketchViewModel {
    return new SketchViewModel({
      view: this.scene.view,
      layer: this.widget.layer,
      updateOnGraphicClick: false,
    });
  }

  protected createSketch(_: SketchViewModel): Graphic {
    return this.graphic;
  }

  protected geometryFromSketch(sketchGraphic: Graphic): G | null {
    return sketchGraphic.geometry.clone() as G;
  }

  protected clippedGeometry<T extends Geometry>(geometry: T): T | null {
    const maskPolygon = this.scene.maskPolygon;
    const result = geometryEngine.intersect(maskPolygon, geometry);
    return result as T;
  }

  protected snapPoint(point: Point): Point {
    const maskPolygon = this.scene.maskPolygon;
    return geometryEngine.nearestCoordinate(maskPolygon, point).coordinate;
  }

  protected snapVertices(vertices: number[][]) {
    const spatialReference = this.scene.view.spatialReference;
    vertices.forEach((point) => {
      const snappedPoint = this.snapPoint(new Point({
        x: point[0],
        y: point[1],
        spatialReference,
      }));
      point[0] = snappedPoint.x;
      point[1] = snappedPoint.y;
    });
  }

  private graphicFromEvent(event: any): Graphic | null {
    if (event.graphics && event.graphics.length) {
      return event.graphics[0];
    }
    return event.graphic;
  }

}

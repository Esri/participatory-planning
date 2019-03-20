
import { create as createPromise } from "esri/core/promiseUtils";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";

import Scene from "../../Scene";
import DrawWidget from "../DrawWidget";
import "../support/extensions";

export default class Operation {

  public scene: Scene;

  public finished: IPromise<Graphic>;

  protected resolve: (value: Graphic) => void;

  protected reject: (error?: any) => void;

  protected layer: GraphicsLayer;

  constructor(public widget: DrawWidget, protected sketchGraphic: Graphic) {
    this.scene = widget.scene;
    this.layer = sketchGraphic.layer as GraphicsLayer;
    this.finished = createPromise(((resolve: (_: Graphic) => void, reject: (error?: any) => void) => {
      this.resolve = resolve;
      this.reject = reject;
    }) as any);

    const lastOp = this.scene.currentOperation;
    if (lastOp) {
      lastOp.cancel();
    }

    this.scene.currentOperation = this;
    this.finished.always(() => {
      if (this.scene.currentOperation === this) {
        this.scene.currentOperation = null;
      }
    });
  }

  public cancel(removeGraphic = false) {
    this.reject("canceled");

    this.finished.catch(() => {
      if (removeGraphic) {
        this.layer.remove(this.sketchGraphic);
      }
    });
  }

  protected complete(graphic: Graphic) {
    const clippedGeometry = this.clippedGeometry(graphic.geometry);
    if (clippedGeometry) {
      graphic.geometry = clippedGeometry;
      this.resolve(graphic);
    } else {
      this.reject("Sketch graphic outside of mask area");
    }
  }

  protected clippedGeometry(geometry: Geometry): Geometry | null {
    const clips = ge.intersect(this.scene.maskPolygon, geometry);
    if (clips instanceof Array) {
      return clips.length ? clips[0] : null;
    } else {
      return clips;
    }
  }

  protected isValidGeometry(geometry: Geometry): boolean {
    return ge.contains(this.scene.maskPolygon, geometry);
  }

}

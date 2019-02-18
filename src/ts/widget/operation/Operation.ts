
import { create as createPromise } from "esri/core/promiseUtils";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";

import Scene from "../../Scene";
import DrawWidget from "../DrawWidget";
import "../support/extensions";

export default class Operation<TargetType = Geometry> {

  public scene: Scene;

  public finished: IPromise<TargetType[]>;

  protected resolve: (value: TargetType[]) => void;

  protected reject: (error?: any) => void;

  constructor(public widget: DrawWidget) {
    this.scene = widget.scene;
    this.finished = createPromise(((resolve: (_: TargetType[]) => void, reject: (error?: any) => void) => {
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

  public cancel() {
    this.reject("canceled");
  }

  protected castGeometry(_: Geometry): TargetType[] {
    throw new Error("Implement in subclasses");
  }

  protected geometry2Polygons(geometry: Geometry): Polygon[] {
    if (geometry instanceof Polygon) {
      if (geometry.rings.length > 1) {
        return geometry.rings.map((ring) => new Polygon({
          rings: [ring],
          spatialReference: geometry.spatialReference,
        }));
      } else {
        return [geometry];
      }
    }
    return [];
  }

  protected geometry2Polylines(geometry: Geometry): Polyline[] {
    if (geometry instanceof Polyline) {
      if (geometry.paths.length > 1) {
        return geometry.paths.map((ring) => new Polyline({
          paths: [ring],
          spatialReference: geometry.spatialReference,
        }));
      } else {
        return [geometry];
      }
    }
    return [];
  }

  protected clippedGeometries(polygon: Geometry): TargetType[] {
    const clips = ge.intersect(this.scene.maskPolygon, polygon);
    if (clips instanceof Array) {
      return clips.map((clip) => this.castGeometry(clip)).reduce((result, val) => result.concat(val));
    } else {
      return this.castGeometry(clips);
    }
  }

}

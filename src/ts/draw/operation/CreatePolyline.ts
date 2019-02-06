
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Polyline from "esri/geometry/Polyline";

import Scene from "../../Scene";
import "../support/extensions";
import CreateOperation from "./CreateOperation";

export default class CreatePolyline extends CreateOperation<Polyline> {

  constructor(scene: Scene, color: Color) {
    super("polyline", scene, color);
  }

  protected resultFromVertices(vertices: number[][]): Polyline[] {
    const polygon = this.createPolyline(vertices);

    return polygon ? this._clippedPolygons(polygon) : [];
  }

  private _distinctPolygon(geometry: Geometry): Polyline[] {
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

  private _clippedPolygons(polygon: Geometry): Polyline[] {
    const clips = ge.intersect(this.scene.maskPolygon, polygon);
    if (clips instanceof Array) {
      return clips.map((clip) => this._distinctPolygon(clip)).reduce((result, val) => result.concat(val));
    } else {
      return this._distinctPolygon(clips);
    }
  }

}

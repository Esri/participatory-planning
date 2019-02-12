
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

    return polygon ? this.clippedGeometries(polygon) : [];
  }

  protected castGeometry(geometry: Geometry): Polyline[] {
    return this.geometry2Polylines(geometry);
  }

}

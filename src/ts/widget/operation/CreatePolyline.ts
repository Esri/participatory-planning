
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Polyline from "esri/geometry/Polyline";

import Scene from "../../Scene";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateMultipointOperation from "./CreateMultipointOperation";

export default class CreatePolyline extends CreateMultipointOperation<Polyline> {

  constructor(widget: DrawWidget, color: Color) {
    super("polyline", widget, color);
  }

  protected resultFromVertices(vertices: number[][]): Polyline[] {
    const polygon = this.createPolyline(vertices);

    return polygon ? this.clippedGeometries(polygon) : [];
  }

  protected castGeometry(geometry: Geometry): Polyline[] {
    return this.geometry2Polylines(geometry);
  }

}

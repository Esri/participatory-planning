
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import Polyline from "esri/geometry/Polyline";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import Scene from "../../Scene";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateOperation from "./CreateOperation";

export interface DrawActionEvent {
  vertices: number[][];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export interface CreatePolygonParams {
  color: Color;
  scene: Scene;
}

const EMPTY_PATH = [[0, 0], [1, 1]];

export default class CreateMultipointOperation extends CreateOperation<DrawActionEvent> {

  constructor(drawAction: string, drawWidget: DrawWidget) {
    super(drawAction, drawWidget);
    this.sketchGraphic.geometry = this.createPolyline([]);
  }

  protected updateSketch(event: DrawActionEvent) {
    this.snapVertices(event.vertices);
    this.sketchGraphic.geometry = this.createPolyline(event.vertices);
  }

  protected createPolyline(vertices: number[][]): Polyline {
    const path = vertices.length < 2 ? EMPTY_PATH : vertices;
    return new Polyline({
      paths: [path],
      spatialReference: this.scene.view.spatialReference,
    });
  }

}

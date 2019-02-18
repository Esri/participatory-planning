
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import Polyline from "esri/geometry/Polyline";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
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

export default class CreateMultipointOperation extends CreateOperation<DrawActionEvent> {

  constructor(drawAction: string, drawWidget: DrawWidget) {
    super(drawAction, drawWidget);
  }

  protected updateSketch(event: DrawActionEvent) {
    this.snapVertices(event.vertices);
    const geometry = this.createPolyline(event.vertices);
    this.sketchGraphic = redraw(this.sketchGraphic, "geometry", geometry);
  }

  protected createPolyline(vertices: number[][]): Polyline {
    return new Polyline({
      paths: vertices.length < 2 ? [] : [vertices],
      spatialReference: this.scene.view.spatialReference,
    });
  }

}

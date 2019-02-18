
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import EsriSymbol from "esri/symbols/Symbol";
import Draw from "esri/views/draw/Draw";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateOperation from "./CreateOperation";

interface DrawActionEvent {
  coordinates: number[];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export default class CreatePoint extends CreateOperation<Point> {

  constructor(widget: DrawWidget, public symbol: EsriSymbol) {
    super(widget);

    this.sketchGraphic.symbol = symbol;

    const action = this.draw.create("point");

    action.on("cursor-update", (event) => this._updateDrawing(event));
    action.on(
      "draw-complete",
      (event) => { this._completeDrawing(event); });
  }

  private _updateDrawing(event: DrawActionEvent) {
    this.snapVertices([event.coordinates]);
    const spatialReference = this.scene.view.spatialReference;
    const geometry = new Point({
      x: event.coordinates[0],
      y: event.coordinates[1],
      z: 2,
      spatialReference,
    });
    this.sketchGraphic = redraw(this.sketchGraphic, "geometry", geometry);
  }

  private _completeDrawing(event: DrawActionEvent) {
    this._updateDrawing(event);
    this.resolve([this.sketchGraphic.geometry as Point]);
  }

}

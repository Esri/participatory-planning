
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import Draw from "esri/views/draw/Draw";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
import "../support/extensions";
import CreateOperation from "./CreateOperation";
import DrawWidget from '../DrawWidget';

interface DrawActionEvent {
  vertices: number[][];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export interface CreatePolygonParams {
  color: Color;
  scene: Scene;
}

export default class CreateMultipointOperation<ResultType extends Geometry> extends CreateOperation<ResultType> {

  constructor(drawAction: string, drawWidget: DrawWidget, color: Color) {
    super(drawWidget);

    this.sketchGraphic.symbol = new SimpleLineSymbol({
      color,
      width: 3,
    });

    const action = this.draw.create(drawAction);

    [
      "vertex-add",
      "vertex-remove",
      "cursor-update",
      "redo",
      "undo",
    ].forEach((eventName) => action.on(eventName, (event) => this._updateDrawing(event)));
    action.on(
      "draw-complete",
      (event) => { this._completeDrawing(event); });
  }

  protected resultFromVertices(_: number[][]): ResultType[] {
    throw new Error("Implement");
  }

  protected createPolyline(vertices: number[][]): Polyline | null {
    return new Polyline({
      paths: vertices.length < 2 ? [] : [vertices],
      spatialReference: this.scene.view.spatialReference,
    });
  }

  protected updateAndValidateDraft(vertices: number[][]) {
    const geometry = this.createPolyline(vertices);
    this.sketchGraphic = redraw(this.sketchGraphic, "geometry", geometry);
  }

  private _updateDrawing(event: DrawActionEvent) {
    this.snapVertices(event.vertices);
    this.updateAndValidateDraft(event.vertices);
  }

  private _completeDrawing(event: DrawActionEvent) {
    this._updateDrawing(event);

    const result = this.resultFromVertices(event.vertices);
    this.resolve(result);
  }

}


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
import Operation from "./Operation";

interface DrawActionEvent {
  vertices: number[][];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export interface CreatePolygonParams {
  color: Color;
  scene: Scene;
}

export default class CreateOperation<ResultType extends Geometry> extends Operation<ResultType[]> {

  protected polylineGraphic: Graphic = new Graphic();

  protected draw: Draw;

  constructor(drawAction: string, scene: Scene, color: Color) {
    super(scene);

    this.draw = new Draw({ view: this.scene.view });

    this.polylineGraphic.symbol = new SimpleLineSymbol({
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

    this.scene.view.focus();

    this.scene.view.container.style.cursor = "crosshair";
    this.scene.sketchLayer.add(this.polylineGraphic);
    this.finished.always(() => {
      this.scene.sketchLayer.remove(this.polylineGraphic);
      this.scene.view.container.style.cursor = "";
      this.draw.reset();
    });
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
    this.polylineGraphic = redraw(this.polylineGraphic, "geometry", geometry);
  }

  private _updateDrawing(event: DrawActionEvent) {
    this._snappedVertices(event);
    this.updateAndValidateDraft(event.vertices);
  }

  private _completeDrawing(event: DrawActionEvent) {
    this._updateDrawing(event);

    const result = this.resultFromVertices(event.vertices);
    this.resolve(result);
  }

  private _snappedVertices(event: DrawActionEvent) {
    const spatialReference = this.scene.view.spatialReference;
    event.vertices.forEach((point) => {
      const mapPoint = new Point({
        x: point[0],
        y: point[1],
        spatialReference,
      });
      if (!ge.contains(this.scene.maskPolygon, mapPoint)) {
        const nearestPoint = ge.nearestCoordinate(this.scene.maskPolygon, mapPoint);
        point[0] = nearestPoint.coordinate.x;
        point[1] = nearestPoint.coordinate.y;
      }
    });
  }

}

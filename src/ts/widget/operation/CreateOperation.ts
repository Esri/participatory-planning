
import ge from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Draw from "esri/views/draw/Draw";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import Operation from "./Operation";

export default class CreateOperation<DrawActionEventType> extends Operation {

  protected readonly draw: Draw;

  protected sketchGraphic = new Graphic();

  private layer: GraphicsLayer;

  constructor(drawAction: string, widget: DrawWidget) {
    super(widget);

    this.layer = widget.layer;
    this.draw = new Draw({ view: this.scene.view });

    this.scene.view.focus();
    this.scene.view.container.style.cursor = "crosshair";

    this.finished.catch(() => {
      this.layer.remove(this.sketchGraphic);
    });
    this.finished.always(() => {
      this.scene.view.container.style.cursor = "";
      this.draw.reset();
    });

    const action = this.draw.create(drawAction);

    action.on(
      [
        "cursor-update",
        "vertex-add",
        "vertex-remove",
        "redo",
        "undo",
      ],
      (event) => this._updateSketch(event) );
    action.on(
      "draw-complete",
      (event) => this._completeSketch(event) );
  }

  protected updateSketch(_: DrawActionEventType) {
    throw new Error("Implement in subclass");
  }

  protected snapVertices(vertices: number[][]) {
    const spatialReference = this.scene.view.spatialReference;
    vertices.forEach((point) => {
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

  private _updateSketch(event: DrawActionEventType) {
    if (!this.sketchGraphic.layer) {
      this.layer.add(this.sketchGraphic);
    }
    this.updateSketch(event);
  }

  private _completeSketch(event: DrawActionEventType) {
    this._updateSketch(event);
    this.complete(this.sketchGraphic);
  }

}

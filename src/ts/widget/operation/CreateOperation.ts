
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";

import Graphic from "esri/Graphic";
import Draw from "esri/views/draw/Draw";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import Operation from "./Operation";

export default class CreateOperation<TargetType = Geometry> extends Operation<TargetType> {

  protected draw: Draw;

  protected sketchGraphic: Graphic = new Graphic();

  constructor(widget: DrawWidget) {
    super(widget);
    this.draw = new Draw({ view: this.scene.view });

    this.scene.view.focus();
    this.scene.view.container.style.cursor = "crosshair";
    this.scene.sketchLayer.add(this.sketchGraphic);
    this.finished.always(() => {
      this.scene.sketchLayer.remove(this.sketchGraphic);
      this.scene.view.container.style.cursor = "";
      this.draw.reset();
    });
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

}

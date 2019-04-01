import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";

import DrawWidget from "../DrawWidget";
import DrawGeometry from "./DrawGeometry";

export default class DrawPoint extends DrawGeometry<Point> {

  constructor(widget: DrawWidget, graphic: Graphic) {
    super(widget, graphic, "point");
  }

  public create(): IPromise<Point> {
    const result = super.create();
    const view = this.widget.app.scene.view;

    // Update graphic when mouse moves
    const handler = view.on("pointer-move", (event) => {
      const mapPoint = view.toMap(event);
      this.addZ(mapPoint);
      this.updateGraphicFromGeometry(mapPoint);
    });

    // Remove event listener when operation is done
    result.always(() => handler.remove());

    return result;
  }

  protected addZ(point: Point | null) {
    if (point) {
      point.z = this.scene.heightAtPoint(point);
    }
  }

  protected geometryFromSketch(sketchGraphic: Graphic): Point | null {
    const point = super.geometryFromSketch(sketchGraphic);
    this.addZ(point);
    return point;
  }

}

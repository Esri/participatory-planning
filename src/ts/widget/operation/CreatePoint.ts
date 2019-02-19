
import Point from "esri/geometry/Point";
import EsriSymbol from "esri/symbols/Symbol";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateOperation from "./CreateOperation";

interface DrawActionEvent {
  coordinates: number[];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export default class CreatePoint extends CreateOperation<DrawActionEvent> {

  constructor(widget: DrawWidget, public symbol: EsriSymbol, layer = widget.scene.sketchLayer) {
    super("point", widget, layer);
    this.sketchGraphic.geometry = new Point();
    this.sketchGraphic.symbol = symbol;
  }

  protected updateSketch(event: DrawActionEvent) {
    this.snapVertices([event.coordinates]);
    const spatialReference = this.scene.view.spatialReference;

    const point = new Point({
      x: event.coordinates[0],
      y: event.coordinates[1],
      spatialReference,
    });
    point.z = this.scene.heightAtPoint(point);
    this.sketchGraphic.geometry = point;
  }

}

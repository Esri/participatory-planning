
import Point from "esri/geometry/Point";
import EsriSymbol from "esri/symbols/Symbol";

import { redraw } from "../../support/graphics";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateOperation from "./CreateOperation";

interface DrawActionEvent {
  coordinates: number[];
  preventDefault: () => void;
  defaultPrevented: boolean;
}

export default class CreatePoint extends CreateOperation<DrawActionEvent> {

  constructor(widget: DrawWidget, public symbol: EsriSymbol) {
    super("point", widget);
    this.sketchGraphic.symbol = symbol;
  }

  protected updateSketch(event: DrawActionEvent) {
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

}

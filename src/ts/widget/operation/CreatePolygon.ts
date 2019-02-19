
import Color from "esri/Color";
import Polygon from "esri/geometry/Polygon";
import Graphic from "esri/Graphic";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateMultipointOperation, { DrawActionEvent } from "./CreateMultipointOperation";

const EMPTY_RING = [[0, 0], [1, 1], [0, 0]];

export default class CreatePolygon extends CreateMultipointOperation {

  protected polylineGraphic = new Graphic();

  private polylineSymbol: SimpleLineSymbol;
  private invalidPolylineSymbol: SimpleLineSymbol;

  constructor(widget: DrawWidget, color: Color) {
    super("polygon", widget);

    this.sketchGraphic.geometry = this.createPolygon([]);
    this.sketchGraphic.symbol = new SimpleFillSymbol({
      color: color.withAlpha(0.3),
      style: "diagonal-cross",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: color.withAlpha(0.2),
        width: "0.5px",
      },
    });

    this.polylineSymbol = new SimpleLineSymbol({
      color,
      width: 3,
    });
    this.invalidPolylineSymbol = this.polylineSymbol.clone();
    this.invalidPolylineSymbol.color = new Color("red");

    this.polylineGraphic.symbol = this.polylineSymbol;
    this.polylineGraphic.geometry = this.createPolyline([]);

    this.finished.always(() => {
      this.scene.sketchLayer.remove(this.polylineGraphic);
    });
  }

  protected createPolygon(vertices: number[][]): Polygon {
    const ring = 2 < vertices.length ?
      vertices.concat([vertices[0]]) :
      EMPTY_RING;
    return new Polygon({
      rings: [ring],
      spatialReference: this.scene.view.spatialReference,
    });
  }

  protected updateSketch(event: DrawActionEvent) {
    this.snapVertices(event.vertices);
    const polyline = this.createPolyline(event.vertices);
    const polygon = this.createPolygon(event.vertices);

    const intersects = polygon.isSelfIntersecting;

    this.sketchGraphic.geometry = polygon; // intersects ? null : polygon;

    if (!this.polylineGraphic.layer) {
      this.scene.sketchLayer.add(this.polylineGraphic);
    }
    this.polylineGraphic.geometry = polyline;
    this.polylineGraphic.symbol = intersects ? this.invalidPolylineSymbol : this.polylineSymbol;
  }

}

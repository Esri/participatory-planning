
import Color from "esri/Color";
import Polygon from "esri/geometry/Polygon";
import Graphic from "esri/Graphic";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import { redraw } from "../../support/graphics";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateMultipointOperation, { DrawActionEvent } from "./CreateMultipointOperation";

export default class CreatePolygon extends CreateMultipointOperation {

  protected polygonGraphic: Graphic = new Graphic();

  private polylineSymbol: SimpleLineSymbol;
  private invalidPolylineSymbol: SimpleLineSymbol;

  constructor(widget: DrawWidget, color: Color) {
    super("polygon", widget);

    this.sketchGraphic.symbol = new SimpleFillSymbol({
      color: color.withAlpha(0.3),
      style: "diagonal-cross",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: color.withAlpha(0.2),
        width: "0.5px",
      },
    });
    this.polylineSymbol = this.sketchGraphic.symbol = new SimpleLineSymbol({
      color,
      width: 3,
    });
    this.invalidPolylineSymbol = this.polylineSymbol.clone();
    this.invalidPolylineSymbol.color = new Color("red");

    this.scene.sketchLayer.add(this.polygonGraphic);
    this.finished.always(() => {
      this.scene.sketchLayer.remove(this.polygonGraphic);
    });
  }

  protected createPolygon(vertices: number[][]): Polygon {
    return new Polygon({
      rings: 2 < vertices.length ? [vertices.concat([vertices[0]])] : [],
      spatialReference: this.scene.view.spatialReference,
    });
  }

  protected updateSketch(event: DrawActionEvent) {
    this.snapVertices(event.vertices);
    const polyline = this.createPolyline(event.vertices);
    const polygon = this.createPolygon(event.vertices);

    const intersects = polygon.isSelfIntersecting;

    this.sketchGraphic = redraw(this.sketchGraphic, "geometry", intersects ? null : polygon);

    this.polygonGraphic = redraw(this.polygonGraphic, "geometry", polyline);
    this.polygonGraphic.symbol = intersects ? this.invalidPolylineSymbol : this.polylineSymbol;
  }

}

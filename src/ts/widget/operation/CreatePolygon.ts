
import Color from "esri/Color";
import Geometry from "esri/geometry/Geometry";
import ge from "esri/geometry/geometryEngine";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
import "../support/extensions";
import CreateMultipointOperation from "./CreateMultipointOperation";

export default class CreatePolygon extends CreateMultipointOperation<Polygon> {

  protected polygonGraphic: Graphic = new Graphic();

  private polylineSymbol: SimpleLineSymbol;
  private invalidPolylineSymbol: SimpleLineSymbol;

  constructor(scene: Scene, color: Color) {
    super("polygon", scene, color);

    this.polygonGraphic.symbol = new SimpleFillSymbol({
      color: color.withAlpha(0.3),
      style: "diagonal-cross",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: color.withAlpha(0.2),
        width: "0.5px",
      },
    });
    this.polylineSymbol = this.sketchGraphic.symbol as SimpleLineSymbol;
    this.invalidPolylineSymbol = this.polylineSymbol.clone();
    this.invalidPolylineSymbol.color = new Color("red");

    this.scene.sketchLayer.add(this.polygonGraphic);
    this.finished.always(() => {
      this.scene.sketchLayer.remove(this.polygonGraphic);
    });
  }

  protected resultFromVertices(vertices: number[][]): Polygon[] {
    const graphic = this.polygonGraphic.geometry;
    return graphic ? this.clippedGeometries(graphic) : [];
  }

  protected updateAndValidateDraft(vertices: number[][]) {
    super.updateAndValidateDraft(vertices);

    const geometry = new Polygon({
      rings: 2 < vertices.length ? [vertices.concat([vertices[0]])] : [],
      spatialReference: this.scene.view.spatialReference,
    });

    const intersects = geometry.isSelfIntersecting;

    this.polygonGraphic = redraw(this.polygonGraphic, "geometry", intersects ? null : geometry);

    this.sketchGraphic.symbol = intersects ? this.invalidPolylineSymbol : this.polylineSymbol;
  }

  protected castGeometry(geometry: Geometry): Polygon[] {
    return this.geometry2Polygons(geometry);
  }

  private _isIntersectingPolyline(polyline: Polyline): boolean {
    const length = polyline.paths.length ? polyline.paths[0].length : 0;
    if (length < 3) {
      return false;
    }
    const line = polyline.clone();

    const spatialReference = this.scene.view.spatialReference;
    const lastSegment = new Polyline({
      paths: [line.paths[0].slice(length - 2)],
      spatialReference,
    });
    line.removePoint(0, length - 1);

    // returns true if the line intersects itself, false otherwise
    return ge.crosses(lastSegment, line);
  }

}

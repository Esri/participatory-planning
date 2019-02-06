
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Widget from "esri/widgets/Widget";

import Scene from "../Scene";
import CreatePolygon from "./operation/CreatePolygon";
import CreatePolyline from "./operation/CreatePolyline";

@subclass("app.draw.DrawWidget")
export default class DrawWidget extends declared(Widget) {

  @property()
  public scene: Scene;

  protected createPolygon(color: Color): IPromise<Polygon[]> {
    return new CreatePolygon(this.scene, color).finished;
  }

  protected createPolyline(color: Color): IPromise<Polyline[]> {
    return new CreatePolyline(this.scene, color).finished;
  }

}

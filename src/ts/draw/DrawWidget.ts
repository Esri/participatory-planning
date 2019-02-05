
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Polygon from "esri/geometry/Polygon";
import Widget from "esri/widgets/Widget";

import Scene from "../Scene";
import CreatePolygon from "./operation/CreatePolygon";

@subclass("app.draw.DrawWidget")
export default class DrawWidget extends declared(Widget) {

  @property()
  public scene: Scene;

  protected createPolygon(color: Color): IPromise<Polygon[]> {
    const operation = new CreatePolygon({
      color,
      scene: this.scene,
    });
    operation.start();
    return operation.result;
  }

}

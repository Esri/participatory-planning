
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { whenOnce } from "esri/core/watchUtils";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import EsriSymbol from "esri/symbols/Symbol";

import Graphic from "esri/Graphic";
import CreatePoint from "./operation/CreatePoint";
import CreatePolygon from "./operation/CreatePolygon";
import CreatePolyline from "./operation/CreatePolyline";
import Operation from "./operation/Operation";
import UpdateOperation from "./operation/UpdateOperation";
import WidgetBase from "./WidgetBase";

@subclass("app.draw.DrawWidget")
export default class DrawWidget extends declared(WidgetBase) {

  @property()
  public layer: GraphicsLayer;

  constructor(params?: any) {
    super(params);

    this.layer = new GraphicsLayer({
      elevationInfo: {
        mode: "on-the-ground",
      },
    });
    whenOnce(this, "scene", () => this.scene.map.add(this.layer));
  }

  public updateGraphic(graphic: Graphic) {
    this.update(graphic);
  }

  protected update(graphic: Graphic): IPromise<Graphic> {
    if (graphic.layer !== this.layer) {
      throw new Error("Graphic must belong to this widget's layer");
    }
    return new UpdateOperation(this, graphic).finished;
  }

  protected createPolygon(color: Color): IPromise<Graphic> {
    return new CreatePolygon(this, new Color("#00FFFF")).finished;
  }

  protected createPolyline(color: Color): IPromise<Graphic> {
    return new CreatePolyline(this, new Color("#00FFFF")).finished;
  }

  protected createPoint(symbol: EsriSymbol): IPromise<Graphic> {
    return new CreatePoint(this, symbol).finished;
  }

}

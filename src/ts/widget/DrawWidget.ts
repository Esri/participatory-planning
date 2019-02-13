
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { whenOnce } from "esri/core/watchUtils";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import GraphicsLayer from "esri/layers/GraphicsLayer";

import CreatePolygon from "./operation/CreatePolygon";
import CreatePolyline from "./operation/CreatePolyline";
import WidgetBase from "./WidgetBase";

@subclass("app.draw.DrawWidget")
export default class DrawWidget extends declared(WidgetBase) {

  protected createGraphicsLayer(drapped: boolean = true): GraphicsLayer {
    const layer = new GraphicsLayer({
      elevationInfo: {
        mode: drapped ? "on-the-ground" : "relative-to-ground",
      },
    });
    whenOnce(this, "scene", () => this.scene.map.add(layer));
    return layer;
  }

  protected createPolygon(color: Color): IPromise<Polygon> {
    return new CreatePolygon(this.scene, color).finished;
  }

  protected createPolyline(color: Color): IPromise<Polyline> {
    return new CreatePolyline(this.scene, color).finished;
  }

}

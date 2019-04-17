/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import { whenOnce } from "esri/core/watchUtils";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import EsriSymbol from "esri/symbols/Symbol";

import DrawPoint from "./operation/DrawPoint";
import DrawPolygon from "./operation/DrawPolygon";
import DrawPolyline from "./operation/DrawPolyline";
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
    whenOnce(this, "app.scene", () => this.app.scene.map.add(this.layer));
  }

  public updateGraphic(graphic: Graphic): IPromise<Graphic[]> {
    if (graphic.geometry.type === "point") {
      return new DrawPoint(this, graphic).update().then(() => [graphic]);
    } else {
      throw new Error("Implement in subclass");
    }
  }

  protected createPolylineGraphic(symbol: EsriSymbol, sketchColor: string): IPromise<Graphic[]> {
    const graphic = new Graphic({ symbol });
    return new DrawPolyline(this, graphic, sketchColor)
      .create()
      .then((polyline) => this.splitPolyline(polyline, graphic));
  }

  protected createPolygonGraphic(symbol: EsriSymbol, sketchColor: string): IPromise<Graphic[]> {
    const graphic = new Graphic({ symbol });
    return new DrawPolygon(this, graphic, sketchColor)
      .create()
      .then((polygon) => this.splitPolygon(polygon, graphic));
  }

  protected createPointGraphic(symbol: EsriSymbol): IPromise<Graphic> {
    const graphic = new Graphic({ symbol });
    return new DrawPoint(this, graphic)
      .create()
      .then(() => {
        return graphic;
      });
  }

  protected updatePolylineGraphic(graphic: Graphic, sketchColor: string): IPromise<Graphic[]> {
    return new DrawPolyline(this, graphic, sketchColor)
      .update()
      .then((polyline) => this.splitPolyline(polyline, graphic));
  }

  protected updatePolygonGraphic(graphic: Graphic, sketchColor: string): IPromise<Graphic[]> {
    return new DrawPolygon(this, graphic, sketchColor)
      .update()
      .then((polygon) => this.splitPolygon(polygon, graphic));
  }

  private splitPolyline(polyline: Polyline, graphic: Graphic): Graphic[] {
    if (1 < polyline.paths.length) {
      const splitGeometries = polyline.paths.map((path) => {
        const clonedGraphic = graphic.clone();
        (clonedGraphic.geometry as Polyline).paths = [path];
        return clonedGraphic;
      });
      this.layer.remove(graphic);
      this.layer.addMany(splitGeometries);
      return splitGeometries;
    } else {
      return [graphic];
    }
  }

  private splitPolygon(polygon: Polygon, graphic: Graphic): Graphic[] {
    if (1 < polygon.rings.length) {
      const splitGeometries = polygon.rings.map((ring) => {
        const clonedGraphic = graphic.clone();
        (clonedGraphic.geometry as Polygon).rings = [ring];
        return clonedGraphic;
      });
      this.layer.remove(graphic);
      this.layer.addMany(splitGeometries);
      return splitGeometries;
    } else {
      return [graphic];
    }
  }

}

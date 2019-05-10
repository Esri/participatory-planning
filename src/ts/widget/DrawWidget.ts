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
    const zIndex = this.zIndexOf(graphic);
    const updatedGraphics = new DrawPolyline(this, graphic, sketchColor)
      .update()
      .then((polyline) => this.splitPolyline(polyline, graphic))
      .then((graphics) => {
        this.reorderGraphics(graphics, zIndex);
        return graphics;
      });

    this.revertOrderedGraphic(updatedGraphics, graphic, zIndex);
    return updatedGraphics;
  }

  protected updatePolygonGraphic(graphic: Graphic, sketchColor: string): IPromise<Graphic[]> {
    const zIndex = this.zIndexOf(graphic);
    const updatedGraphics = new DrawPolygon(this, graphic, sketchColor)
      .update()
      .then((polygon) => this.splitPolygon(polygon, graphic))
      .then((graphics) => {
        this.reorderGraphics(graphics, zIndex);
        return graphics;
      });

    this.revertOrderedGraphic(updatedGraphics, graphic, zIndex);
    return updatedGraphics;
  }

  private zIndexOf(graphic: Graphic): number {
    return this.layer.graphics.indexOf(graphic);
  }

  private reorderGraphics(graphics: Graphic[], zIndex: number) {
    this.layer.removeMany(graphics);
    const graphicsOnTop = this.layer.graphics.slice(zIndex).toArray();
    this.layer.removeMany(graphicsOnTop);
    this.layer.addMany(graphics);
    this.layer.addMany(graphicsOnTop.map((g) => Graphic.fromJSON(g.toJSON())));
  }

  private revertOrderedGraphic(promise: IPromise<any>, originalGraphic: Graphic, zIndex: number) {
    // The JS API will emit a cancel event if the graphic has not changed, even if it changed the order. We fix this
    // by catching and calling reorderGraphics().
    promise.catch(() => {
      const newZIndex = this.zIndexOf(originalGraphic);
      if (0 <= newZIndex) {
        this.reorderGraphics([originalGraphic], zIndex);
      }
    });
  }

  private splitPolyline(polyline: Polyline, graphic: Graphic): Graphic[] {
    const graphics: Graphic[] = [];
    if (1 < polyline.paths.length) {
      polyline.paths.forEach((path) => {
        const clonedGraphic = graphic.clone();
        (clonedGraphic.geometry as Polyline).paths = [path];
        graphics.push(clonedGraphic);
      });
    } else {
      graphics.push(graphic);
    }
    return graphics;
  }

  private splitPolygon(polygon: Polygon, graphic: Graphic): Graphic[] {
    const graphics = [];
    if (1 < polygon.rings.length) {
      polygon.rings.forEach((ring) => {
        const clonedGraphic = graphic.clone();
        (clonedGraphic.geometry as Polygon).rings = [ring];
        graphics.push(clonedGraphic);
      });
    } else {
      graphics.push(graphic);
    }
    return graphics;
  }

}

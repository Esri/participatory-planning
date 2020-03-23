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
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";

import DrawWidget from "../DrawWidget";
import DrawGeometry from "./DrawGeometry";

export default class DrawPoint extends DrawGeometry<Point> {

  constructor(widget: DrawWidget, graphic: Graphic) {
    super(widget, graphic, "point");
  }

  public create(): Promise<Point> {
    const result = super.create();
    const view = this.widget.app.scene.view;

    // Update graphic when mouse moves
    const handler = view.on("pointer-move", (event) => {
      const mapPoint = view.toMap(event);
      if (mapPoint) {
        const snappedPoint = this.snapAndAddZ(mapPoint);
        this.updateGraphicFromGeometry(snappedPoint);
      }
    });

    // Remove event listener when operation is done
    result.finally(() => handler.remove());

    return result;
  }

  protected snapAndAddZ(point: Point ) {
    const snappedPoint = this.snapPoint(point);
    snappedPoint.z = this.scene.heightAtPoint(snappedPoint);
    return snappedPoint;
  }

  protected geometryFromSketch(sketchGraphic: Graphic): Point | null {
    const point = super.geometryFromSketch(sketchGraphic);
    if (point) {
      return this.snapAndAddZ(point);
    }
    return null;
  }

}

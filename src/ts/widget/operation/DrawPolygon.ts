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

import Color from "@arcgis/core/Color";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

import DrawWidget from "../DrawWidget";
import DrawGeometry from "./DrawGeometry";

export default class DrawPolygon extends DrawGeometry<Polygon> {
  constructor(
    widget: DrawWidget,
    graphic: Graphic,
    protected sketchColor: string
  ) {
    super(widget, graphic, "polygon");
  }

  protected createSketchViewModel(): SketchViewModel {
    const sketchViewModel = super.createSketchViewModel();

    const color = new Color(this.sketchColor);
    color.a = 0.5;

    if (sketchViewModel.polygonSymbol.type === "simple-fill") {
      sketchViewModel.polygonSymbol.color = color;
      sketchViewModel.polygonSymbol.outline.width = 0;
    }

    sketchViewModel.polylineSymbol.color = color;

    if (sketchViewModel.pointSymbol.type === "simple-marker") {
      sketchViewModel.pointSymbol.color = color;
      sketchViewModel.pointSymbol.outline.width = 0;
    }

    return sketchViewModel;
  }

  protected createSketch(sketchViewModel: SketchViewModel): Graphic {
    const sketchGraphic = this.graphic.clone();
    sketchGraphic.symbol = sketchViewModel.polygonSymbol;
    return sketchGraphic;
  }

  protected geometryFromSketch(sketchGraphic: Graphic): Polygon | null {
    const geometry = super.geometryFromSketch(sketchGraphic);
    return geometry ? this.clippedGeometry(geometry) : null;
  }
}

import Color from "esri/Color";
import Polygon from "esri/geometry/Polygon";
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";

import DrawWidget from "../DrawWidget";
import DrawGeometry from "./DrawGeometry";

export default class DrawPolygon extends DrawGeometry<Polygon> {

  constructor(widget: DrawWidget, graphic: Graphic, protected sketchColor: string) {
    super(widget, graphic, "polygon");
  }

  protected createSketchViewModel(): SketchViewModel {
    const sketchViewModel = super.createSketchViewModel();

    const color = new Color(this.sketchColor);
    color.a = 0.5;

    sketchViewModel.polygonSymbol.color = color;
    sketchViewModel.polygonSymbol.outline.width = 0;

    sketchViewModel.polylineSymbol.color = color;

    sketchViewModel.pointSymbol.color = color;
    sketchViewModel.pointSymbol.outline.width = 0;

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

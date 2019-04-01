
import Color from "esri/Color";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import DrawWidget from "../DrawWidget";
import "../support/extensions";
import DrawGeometry from "./DrawGeometry";

export default class DrawPolyline extends DrawGeometry<Polyline> {

  constructor(widget: DrawWidget, graphic: Graphic, protected sketchColor: string) {
    super(widget, graphic, "polyline");
  }

  protected createSketchViewModel(): SketchViewModel {
    const sketchViewModel = super.createSketchViewModel();

    const color = new Color(this.sketchColor);
    color.a = 0.5;

    sketchViewModel.polylineSymbol.color = color;

    sketchViewModel.pointSymbol.color = color;
    sketchViewModel.pointSymbol.outline.width = 0;

    return sketchViewModel;
  }

  protected createSketch(sketchViewModel: SketchViewModel): Graphic {
    const sketchGraphic = this.graphic.clone();
    sketchGraphic.symbol = sketchViewModel.polylineSymbol;
    return sketchGraphic;
  }

  protected geometryFromSketch(sketchGraphic: Graphic): Polyline | null {
    let polyline = super.geometryFromSketch(sketchGraphic);
    polyline = polyline ? this.clippedGeometry(polyline) : null;
    return polyline;

    // Trying to be smart to snap lines back onto the masking polygon
    // polyline.paths.forEach((path) => this.snapVertices(path));
    // if (polyline.paths.length && 2 <= polyline.paths[0].length) {
    //   const path = polyline.paths.reduce((total, segment) => total.concat(segment));
    //   polyline = new Polyline({
    //     paths: [path],
    //     spatialReference: this.scene.view.spatialReference,
    //   });
    // }
  }

}

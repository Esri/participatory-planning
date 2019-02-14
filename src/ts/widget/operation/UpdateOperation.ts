
import Geometry from "esri/geometry/Geometry";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
import "../support/extensions";
import Operation from "./Operation";

import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');
import Graphic = require('esri/Graphic');
import DrawWidget from '../DrawWidget';

export default class UpdateOperation extends Operation<Graphic> {

  private sketchViewModel: SketchViewModel;

  constructor(public graphic: Graphic, widget: DrawWidget) {
    super(widget);

    this.sketchViewModel = new SketchViewModel({
      view: this.scene.view,
      layer: graphic.layer,
    });

    this.sketchViewModel.on("update", (event) => {
      if (event.state === "complete" || event.state === "cancel") {
        const result = this.clippedGeometries(graphic.geometry);
        this.resolve(result);
      }
    });

    this.sketchViewModel.update(graphic);
  }

  protected castGeometry(geometry: Geometry): Graphic[] {
    this.graphic.geometry = geometry;
    return [this.graphic];
  }

}

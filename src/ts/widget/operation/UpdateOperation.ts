
import Geometry from "esri/geometry/Geometry";

import "../support/extensions";
import Operation from "./Operation";

import Point = require("esri/geometry/Point");
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import DrawWidget from "../DrawWidget";

export default class UpdateOperation extends Operation {

  private sketchViewModel: SketchViewModel;

  constructor(widget: DrawWidget, graphic: Graphic) {
    super(widget, graphic);

    this.sketchViewModel = new SketchViewModel({
      view: this.scene.view,
      layer: graphic.layer,
    });

    if (graphic.geometry.hasZ) {
      const watchHandle = graphic.watch("geometry", () => {
        this.scene.adjustHeight(graphic);
      });
      this.finished.always(() => watchHandle.remove());
    }

    this.sketchViewModel.on("update", (event) => {
      if (event.state === "complete" || event.state === "cancel") {
        this.complete(graphic);
      }
    });

    this.finished.always(() => {
      if (this.sketchViewModel.activeTool) {
        this.sketchViewModel.cancel();
      }
    });

    // Workaround for `SketchViewModel` not supporting flying graphics
    const hasZ = graphic.geometry.hasZ;
    if (hasZ) {
      graphic.geometry.hasZ = false;
    }

    this.sketchViewModel.update(graphic);

    if (hasZ) {
      graphic.geometry.hasZ = true;
    }

  }

}

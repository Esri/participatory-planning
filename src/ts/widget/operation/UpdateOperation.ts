
import Geometry from "esri/geometry/Geometry";

import "../support/extensions";
import Operation from "./Operation";

import Point = require("esri/geometry/Point");
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import DrawWidget from "../DrawWidget";

export default class UpdateOperation extends Operation {

  private sketchViewModel: SketchViewModel;

  private resultingGraphic: Graphic;

  private lastValidGeometry: Geometry;

  constructor(widget: DrawWidget, graphic: Graphic) {
    super(widget, graphic);

    this.resultingGraphic = graphic.clone();
    this.layer.add(this.resultingGraphic);
    // graphic.visible = false;

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
      } else {
        if (this.isValidGeometry(graphic.geometry)) {
          this.lastValidGeometry = graphic.geometry;
        } else {
          graphic.geometry = this.lastValidGeometry;
        }
        console.log(event.state, this.isValidGeometry(graphic.geometry), event);
      }
    });

    this.finished.always(() => {
      this.sketchViewModel.cancel();
      this.sketchViewModel.destroy();
      this.layer.remove(this.resultingGraphic);
      graphic.visible = true;
    });

    // Workaround for `SketchViewModel` not supporting flying graphics
    const hasZ = graphic.geometry.hasZ;
    const lastGeometry = graphic.geometry.clone();
    if (hasZ) {
      graphic.geometry.hasZ = false;
    }

    this.sketchViewModel.update(graphic);

    if (hasZ) {
      graphic.geometry = lastGeometry;
    }

  }

}

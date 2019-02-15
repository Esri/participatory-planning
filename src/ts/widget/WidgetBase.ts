
// esri
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";

import Scene from "../Scene";

@subclass("app.widgets.WidgetBase")
export default class WidgetBase extends declared(Widget) {

  @property()
  public scene: Scene;

  constructor(params: any = {}) {
    super(params);
  }

  protected toggleLoadingIndicator(show: boolean, percentage: number = 0) {
    this.toggleElement("loadingIndicator", show);
    this.toggleOverlay(show);
    const text = document.getElementById("loadingIndicatorText");
    if (text) {
      if (0 < percentage && percentage <= 100) {
        text.innerText = "Loading " + percentage + "%...";
      } else {
        text.innerText = "Loading...";
      }
    }
  }

  protected toggleElement(id: string, show: boolean) {
    const element = document.getElementById(id);
    if (element) {
      if (show) {
        element.classList.remove("hide");
      } else {
        element.classList.add("hide");
      }
    }
  }

  protected toggleOverlay(show: boolean) {
    this.toggleElement("overlay", show);
  }

}

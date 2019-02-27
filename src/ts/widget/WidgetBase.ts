
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

  protected toggleLoadingIndicator(show: boolean, message = "Loading...") {
    this.toggleElement("loadingIndicator", show);
    this.toggleOverlay(show);
    const text = document.getElementById("loadingIndicatorText");
    if (text) {
      text.innerText = message;
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

  protected toggleOverlay(show: boolean, opacity = 0.6) {
    this.toggleElement("overlay", show);
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.style.opacity = opacity.toString();
    }
  }

}

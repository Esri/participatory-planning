
import Color from "esri/Color";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import CreateMultipointOperation from "./CreateMultipointOperation";

export default class CreatePolyline extends CreateMultipointOperation {

  constructor(widget: DrawWidget, color: Color) {
    super("polyline", widget);

    this.sketchGraphic.symbol = new SimpleLineSymbol({
      color,
      width: 3,
    });
  }

}

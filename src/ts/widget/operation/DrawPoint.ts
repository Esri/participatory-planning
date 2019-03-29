
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import EsriSymbol from "esri/symbols/Symbol";

import DrawWidget from "../DrawWidget";
import "../support/extensions";
import DrawGeometry from "./DrawGeometry";

export default class DrawPoint extends DrawGeometry<Point> {

  constructor(widget: DrawWidget, graphic: Graphic) {
    super(widget, graphic, "point");
  }

}

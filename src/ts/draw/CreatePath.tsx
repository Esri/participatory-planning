
import Scene from "../Scene";

// esri
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection = require("esri/core/Collection");
import Point from "esri/geometry/Point";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import Draw from "esri/views/draw/Draw";
import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');

@subclass("app.draw.CreateBuilding")
export default class CreatePath extends declared(Widget) {

  @property()
  public scene: Scene;

  private sketchModel: SketchViewModel;

  constructor(params?: any) {
    super(params);
  }

  public postInitialize() {
    this.sketchModel = new SketchViewModel({
      layer: this.scene.drawLayer,
      view: this.scene.view,
    });
  }

  public render() {
    return (
      <div>
        <div class="menu">
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this) }>Create Street</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this) }>Create Walking Path</button>
          </div>
        </div>
      </div>
    );
  }

  private _startDrawing(stories: number) {
    this.sketchModel.reset();
    this.sketchModel.create("polyline");
  }

}


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
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";

import { contains, nearestCoordinate } from "esri/geometry/geometryEngine";

@subclass("app.draw.CreateArea")
export default class CreateArea extends declared(Widget) {

  @property()
  public scene: Scene;

  private sketchModel: SketchViewModel;

  constructor(params?: any) {
    super(params);
  }

  public postInitialize() {
    this.sketchModel = new SketchViewModel({
      layer: this.scene.groundLayer,
      view: this.scene.view,
    });

    // Listen to sketch model state changes
    let listener: {remove: () => void} | null;
    this.sketchModel.watch("state", () => {

      if (this.sketchModel.state === "active") {
        listener = this.scene.view.on(["pointer-move", "pointer-down"], (event) => {
          const mapPoint = this.scene.view.toMap({x: event.x, y: event.y});
          if (!contains(this.scene.maskPolygon, mapPoint)) {
            event.stopPropagation();
          }
        });
      } else {
        if (listener) {
          listener.remove();
          listener = null;
        }
      }
    });
  }

  public render() {
    return (
      <div>
        <div class="menu">
        <div class="menu-item">
          <button class="btn" onclick={ this._startDrawing.bind(this, "#ffffff") }>Create Ground</button>
        </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, "#bdce8a") }>Create Lawn</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, "#a0b4cf") }>Create Water</button>
          </div>
        </div>
      </div>
    );
  }

  private _startDrawing(color: any) {
    this.sketchModel.polygonSymbol = {
      type: "simple-fill",
      outline: {
        width: 0,
      },
      color,
    } as any;
    this.sketchModel.reset();
    this.sketchModel.create("polygon");
  }

}

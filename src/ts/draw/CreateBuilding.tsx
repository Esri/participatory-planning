
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

@subclass("app.draw.CreateBuilding")
export default class CreateBuilding extends declared(Widget) {

  @property()
  public scene: Scene;

  private draw: Draw;

  private stories: number = 3;

  constructor(params?: any) {
    super(params);
  }

  public postInitialize() {
    this.draw = new Draw({
      view: this.scene.view,
    });
  }

  public render() {
    return (
      <div>
        <div class="menu">
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, 3) }>3-Story Building</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, 5) }>5-Story Building</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, 10) }>10-Story Building</button>
          </div>
        </div>
      </div>
    );
  }

  private _startDrawing(stories: number) {

    this.stories = stories;
    this.draw.reset();

    const action = this.draw.create("polygon", {mode: "click"});
    action.on([
        "vertex-add",
        "vertex-remove",
        "cursor-update",
        "redo",
        "undo",
      ] as any,
      this._drawPolygon.bind(this),
    );
    action.on("draw-complete", this._completePolygon.bind(this));
    this.scene.view.focus();
  }

  private _drawPolygon(event: any) {
    // create a new graphic presenting the polyline that is being drawn on the view
    console.log("Event", event);
    const view = this.scene.view;
    view.graphics.removeAll();

    const geometry = this._createGeometry(event);

    // a graphic representing the polyline that is being drawn
    const graphic = new Graphic({
      geometry,
      symbol: {
        type: "simple-line", // autocasts as new SimpleFillSymbol
        color: [4, 90, 141],
        width: 4,
        cap: "round",
        join: "round",
      },
    } as any);

    // check if the polyline intersects itself.
    view.graphics.add(graphic);
  }

  private _completePolygon(event: any) {
    this.scene.view.graphics.removeAll();

    const geometry = this._createGeometry(event);

    if (geometry.type !== "polygon") {
      return;
    }

    const building =  new Graphic({
      geometry,
      symbol: {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: "#FFF",
          },
          edges: {
            type: "solid",
            color: "#AAA",
            size: 0.5,
          },
          size: this.stories * 3,
        }],
      },
    } as any);

    this.scene.drawLayer.add(building);
  }

  private _createGeometry(event: any): any {
    const vertices = event.vertices;
    if (vertices.length > 2) {
      return {
        type: "polygon",
        rings: vertices,
        spatialReference: this.scene.view.spatialReference,
      };
    } else {
      return {
        type: "polyline",
        paths: vertices,
        spatialReference: this.scene.view.spatialReference,
      };
    }
  }

}


import Scene from "../Scene";

import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { contains, nearestCoordinate } from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Graphic from "esri/Graphic";
import Draw from "esri/views/draw/Draw";
import Widget from "esri/widgets/Widget";

export const enum DrawWidgetState {
  Idle = "idle",
  Create = "create",
  Update = "update",
}

@subclass("app.draw.DrawWidget")
export default class DrawWidget extends declared(Widget) {

  @property()
  public state: DrawWidgetState = DrawWidgetState.Idle;

  @property()
  public scene: Scene;

  private draw: Draw;

  public postInitialize() {
    this.draw = new Draw({
      view: this.scene.view,
    });
  }

  protected createPolygon() {
    this.state = DrawWidgetState.Create;
    const action = this.draw.create("polygon", { mode: "click" });
    this.scene.view.container.style.cursor = "crosshair";
    action.on([
        "vertex-add",
        "vertex-remove",
        "cursor-update",
        "redo",
        "undo",
      ] as any,
      this._drawNewPolygon.bind(this),
    );
    action.on("draw-complete", this._completeNewPolygon.bind(this));
    this.scene.view.focus();
  }

  protected onPolygonCreated(_: Polygon) {
    // do be overriden by children
  }

  private _drawNewPolygon(event: any) {
    // create a new graphic presenting the polyline that is being drawn on the view
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

  private _completeNewPolygon(event: any) {
    this.scene.view.container.style.cursor = "";
    this.scene.view.graphics.removeAll();

    const geometry = this._createGeometry(event) as Polygon;

    if (!geometry) {
      return;
    }
    if (!geometry.isClockwise(geometry.rings[0])) {
      geometry.rings = [geometry.rings[0].slice().reverse()];
    }

    this.draw.reset();
    this.state = DrawWidgetState.Idle;
    this.onPolygonCreated(geometry);
  }

  private _fixPaths(paths: number[][]): boolean {
    let fixed = false;
    paths.forEach((point) => {
      const mapPoint = new Point({
        x: point[0],
        y: point[1],
        spatialReference: this.scene.view.spatialReference,
      });
      if (!contains(this.scene.maskPolygon, mapPoint)) {
        const nearestPoint = nearestCoordinate(this.scene.maskPolygon, mapPoint);
        point[0] = nearestPoint.coordinate.x;
        point[1] = nearestPoint.coordinate.y;
        fixed = true;
      }
    });
    return fixed;
  }

  private _createGeometry(event: any): any {
    this._fixPaths(event.vertices);
    const vertices = event.vertices.slice();
    if (vertices.length > 2) {
      const polygon = new Polygon({
        rings: vertices,
        spatialReference: this.scene.view.spatialReference,
      });
      return polygon;
    } else {
      return {
        type: "polyline",
        paths: vertices,
        spatialReference: this.scene.view.spatialReference,
      };
    }
  }

}

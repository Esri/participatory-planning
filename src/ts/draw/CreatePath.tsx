
import Scene from "../Scene";

// esri
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { contains, nearestCoordinate } from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polyline from "esri/geometry/Polyline";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(Widget) {

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
    this.sketchModel.on("create", this._onSketchModelEvent.bind(this));

    this.sketchModel.polylineSymbol =  {
      type: "simple-line", // autocasts as SimpleLineSymbol()
      cap: "round",
      color: "#b2b3b2",
      width: 20,
    } as any;

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

  private _fixPaths(paths: number[][][]): boolean {
    let fixed = false;
    paths.forEach((path) => {
      path.forEach((point, index) => {
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
    });
    return fixed;
  }

  private _onSketchModelEvent(event: any) {

    if (!event.graphic.geometry) {
      return;
    }

    const polyline = event.graphic.geometry as Polyline;
    // const paths = polyline.paths[0];
    if (this._fixPaths(polyline.paths)) {
      // event.graphic.geometry = event.graphic.geometry.clone();
      // this.sketchModel.createGraphic.geometry = event.graphic.geometry;

    }

    // const mousePoint = this._pointFromEventInfo(event.toolEventInfo);
    // if (mousePoint) {
    //   if (!contains(this.scene.maskPolygon, mousePoint)) {
    //     if (event.toolEventInfo.type === "vertex-add") {
    //       this.sketchModel.undo();
    //     }
    //   }
    // }
  }

  private _coordinatesFromEventInfo(eventInfo: any | null): number[] | undefined {
    if (eventInfo) {
      switch (eventInfo.type) {
        case "cursor-update":
          return eventInfo.coordinates;
        case "vertex-add":
          return eventInfo.added;
        default:
          break;
        }
    }
  }

  private _pointFromEventInfo(eventInfo: any): Point | undefined {
    const coordinates = this._coordinatesFromEventInfo(eventInfo);
    if (coordinates) {
      return new Point({
        x: coordinates[0],
        y: coordinates[1],
        spatialReference: this.scene.view.spatialReference,
      });
    }
  }

}

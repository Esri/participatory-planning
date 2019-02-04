
import Scene from "../Scene";
import DrawWidget from "./DrawWidget";

// esri
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { contains } from "esri/geometry/geometryEngine";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import { tsx } from "esri/widgets/support/widget";

@subclass("app.draw.CreateArea")
export default class CreateArea extends declared(DrawWidget) {

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

    const validSymbol = {
      type: "simple-fill",
      style: "solid",
      color: [0, 170, 255, 0.8],
      outline: {
        color: [255, 255, 255],
        width: 2,
      },
    };
    const invalidSymbol = {
      type: "simple-fill",
      style: "diagonal-cross",
      color: [255, 0, 0],
      outline: {
        color: [255, 0, 0],
        width: 4,
      },
    };

    this.sketchModel.on(["create", "update", "undo", "redo"] as any, (event) => {
      // do tnog
      const graphic = event.graphic; // s[0]
      if (graphic) {
        // if (contains(this.scene.maskPolygon, graphic)) {
        //   graphic.symbol = validSymbol;
        // } else {
        //   graphic.symbol = invalidSymbol;
        // }
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

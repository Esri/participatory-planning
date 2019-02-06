
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
import Polygon = require('esri/geometry/Polygon');
import Graphic = require('esri/Graphic');
import Color = require('esri/Color');

@subclass("app.draw.CreateArea")
export default class CreateArea extends declared(DrawWidget) {

  @property()
  public scene: Scene;

  constructor(params?: any) {
    super(params);
  }

  public render() {
    return (
      <div>
        <div class="menu">
        <div class="menu-item">
          <button class="btn" onclick={ this._startDrawing.bind(this, "#f0f0f0") }>Create Ground</button>
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

  protected onPolygonCreated(geometry: Polygon) {

  }

  private _startDrawing(color: string) {
    this.createPolygon(new Color(color)).then((polygons) => {
      polygons.forEach((geometry) => {
        const building = new Graphic({
          geometry,
          symbol: {
            type: "simple-fill",
            color,
            outline: {
              width: 0,
            },
          },
        } as any);

        this.scene.groundLayer.add(building);
      });
    });
  }

}

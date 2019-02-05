
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

  private currentColor: Color;

  constructor(params?: any) {
    super(params);
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

  protected onPolygonCreated(geometry: Polygon) {
    const building = new Graphic({
      geometry,
      symbol: {
        type: "simple-fill",
        color: this.currentColor,
        outline: {
          width: 0,
        },
      },
    } as any);

    this.scene.groundLayer.add(building);
  }

  private _startDrawing(color: string) {
    this.currentColor = new Color(color);
    this.createPolygon(this.currentColor);
  }

}

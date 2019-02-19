
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import { tsx } from "esri/widgets/support/widget";

@subclass("app.draw.CreateBuilding")
export default class CreateBuilding extends declared(DrawWidget) {

  private stories: number = 3;

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
    this.createPolygon(new Color("#d6bb7a")).then((newBuilding) => {
      newBuilding.symbol = {
        type: "polygon-3d",
        symbolLayers: [{
          type: "extrude",
          material: {
            color: "#FFF",
          },
          edges: {
            type: "sketch",
            color: [100, 100, 100],
            extensionLength: 5,
          },
          size: this.stories * 3,
        }],
      } as any;
    });
  }

}

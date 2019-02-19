
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { tsx } from "esri/widgets/support/widget";

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(DrawWidget) {

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

  private _startDrawing() {
    this.createPolyline(new Color("#b2b2b2")).then((newPath) => {
      newPath.symbol = {
        type: "simple-line",
        color: new Color("#cbcbcb"),
        width: 20,
      } as any;
    });
  }

}

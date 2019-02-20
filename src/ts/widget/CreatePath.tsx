
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(DrawWidget) {

  public render() {
    return (
      <div>
        <div class="menu">
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, true) }>Create Street</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, false) }>Create Walking Path</button>
          </div>
        </div>
      </div>
    );
  }

  private _startDrawing(street: boolean) {
    const color = street ? new Color("#cbcbcb") : new Color("#b2b2b2");
    this.createPolyline(color).then((newPath) => {
      newPath.symbol = {
        type: "simple-line",
        color,
        width: street ? 20 : 3,
      } as any;
    });
  }

}

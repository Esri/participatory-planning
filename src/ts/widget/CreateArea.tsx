
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";

interface ColorMenu {
  label: string;
  color: string;
}

@subclass("app.draw.CreateArea")
export default class CreateArea extends declared(DrawWidget) {

  @renderable()
  @property()
  private activeColor: string | null = null;

  private colorMenus: ColorMenu[] = [
    {
      label: "Ground",
      color: "#f0f0f0",
    },
    {
      label: "Lawn",
      color: "#bdce8a",
    },
    {
      label: "Beach",
      color: "#dfca8f",
    },
    {
      label: "Water",
      color: "#a0b4cf",
    },
  ];

  public render() {
    const inactive = "btn btn-large";
    const active = inactive + " active";
    return (
      <div>
        <div class="menu">
          { this.colorMenus.map((menu) => (
            <div class="menu-item">
              <button
                class={menu.color === this.activeColor ? active : inactive}
                onclick={ this._startDrawing.bind(this, menu.color) }>Create {menu.label}</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  private _startDrawing(color: string, sketchColor: string = color) {
    this.activeColor = color;
    this.createPolygon(new Color(sketchColor)).then((newArea) => {
      newArea.symbol = {
        type: "simple-fill",
        color: this.activeColor,
        outline: {
          width: 0,
        },
      } as any;
      this.activeColor = null;
    });
  }

}

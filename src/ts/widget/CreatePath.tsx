
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";

interface PathMenu {
  label: string;
  color: string;
  width: number;
}

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(DrawWidget) {

  @renderable()
  @property()
  private activeMenu: PathMenu | null = null;

  private menus: PathMenu[] = [
    {
      label: "Street",
      color: "#cbcbcb",
      width: 20,
    },
    {
      label: "Walking Path",
      color: "#b2b2b2",
      width: 3,
    },
  ];

  public render() {
    const inactive = "btn btn-large";
    const active = inactive + " active";
    return (
      <div>
        <div class="menu">
          { this.menus.map((menu) => (
            <div class="menu-item">
              <button
                class={menu === this.activeMenu ? active : inactive}
                onclick={ this._startDrawing.bind(this, menu) }>Create {menu.label}</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  private _startDrawing(menu: PathMenu) {
    this.activeMenu = menu;
    this.createPolyline(new Color(menu.color)).then((newPath) => {
      newPath.symbol = {
        type: "simple-line",
        color: menu.color,
        width: menu.width,
      } as any;
      this.activeMenu = null;
    });
  }

}

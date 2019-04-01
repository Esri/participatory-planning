
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";
import DrawWidget from "./DrawWidget";

import Graphic from "esri/Graphic";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

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

  public updateGraphic(graphic: Graphic): IPromise<Graphic[]> {
    return this.updatePolylineGraphic(graphic, graphic.symbol.color.toHex());
  }

  private _startDrawing(menu: PathMenu) {
    const symbol = new SimpleLineSymbol({
      color: menu.color,
      width: menu.width,
    });

    this.createPolylineGraphic(symbol, menu.color).always(() => {
      this.activeMenu = null;
    });
    this.activeMenu = menu;
  }

}

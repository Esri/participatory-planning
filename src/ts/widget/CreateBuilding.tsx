import "./support/extensions";

import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import { renderable, tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";

// esri
const BUILDING_COLOR = "#FFFFFF";
const BUILDING_FLOOR_HEIGHT = 3;

@subclass("app.draw.CreateBuilding")
export default class CreateBuilding extends declared(DrawWidget) {

  @renderable()
  @property()
  private stories: number;

  public render() {
    const inactive = "btn btn-large";
    const active = inactive + " active";
    return (
      <div>
        <div class="menu">
          { [3, 5, 10].map((stories) => (
            <div class="menu-item">
              <button
                class={stories === this.stories ? active : inactive}
                onclick={ this._startDrawing.bind(this, stories) }>{stories}-Story Building</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  public updateGraphic(graphic: Graphic): IPromise<Graphic[]> {
    return this.updatePolygonGraphic(graphic, BUILDING_COLOR);
  }

  private _startDrawing(stories: number) {

    const size = stories * BUILDING_FLOOR_HEIGHT;

    const color = BUILDING_COLOR;

    const symbol = new PolygonSymbol3D({
      symbolLayers: [{
        type: "extrude",
        material: {
          color,
        },
        edges: {
          type: "solid",
          color: [100, 100, 100],
        },
        size,
      }] as any,
    });
    this.createPolygonGraphic(symbol, color).always(() => {
      this.stories = 0;
    });
    this.stories = stories;
  }

}

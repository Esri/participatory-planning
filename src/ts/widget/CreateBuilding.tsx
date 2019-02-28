
// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import ExtrudeSymbol3DLayer from "esri/symbols/ExtrudeSymbol3DLayer";
import PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import { renderable, tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";
import "./support/extensions";

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

  public updateGraphic(buildingGraphic: Graphic) {
    const size = this._getSize(buildingGraphic);
    buildingGraphic.symbol = this._createSymbol(size, 0.5);
    this.update(buildingGraphic).then((updatedBuilding) => {
      updatedBuilding.symbol = this._createSymbol(size, 1);
    });
  }

  private _startDrawing(stories: number) {
    this.stories = stories;
    this.createPolygon(new Color("#d6bb7a"))
    .then((newBuilding) => {
      newBuilding.symbol = this._createSymbol(stories * 3, 1);
      this.stories = 0;
    });
  }

  private _createSymbol(size: number, opacity: number): any {
    return {
      type: "polygon-3d",
      symbolLayers: [{
        type: "extrude",
        material: {
          color: [255, 255, 255, opacity],
        },
        edges: {
          type: "solid",
          color: [100, 100, 100],
        },
        size,
      }],
    };
  }

  private _getSize(buildingGraphic: Graphic): number {
    const layers = (buildingGraphic.symbol as PolygonSymbol3D).symbolLayers;
    if (layers && layers.length) {
      return (layers.getItemAt(0) as ExtrudeSymbol3DLayer).size;
    }
    return 9;
  }

}


// esri
import Color from "esri/Color";
import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import ExtrudeSymbol3DLayer from "esri/symbols/ExtrudeSymbol3DLayer";
import PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import { tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";
import "./support/extensions";

@subclass("app.draw.CreateBuilding")
export default class CreateBuilding extends declared(DrawWidget) {

  private stories = 3;

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

  public updateGraphic(buildingGraphic: Graphic) {
    this.stories = this._getStories(buildingGraphic);
    buildingGraphic.symbol = new SimpleFillSymbol({
      color: new Color("#d6bb7a").withAlpha(0.3),
      style: "diagonal-cross",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: new Color("#d6bb7a").withAlpha(0.2),
        width: "0.5px",
      },
    });
    this.update(buildingGraphic).then((updatedBuilding) => {
      this._applyBuildingSymbol(updatedBuilding);
    });
  }

  private _getStories(buildingGraphic: Graphic): number {
    const polygonSymbol = buildingGraphic.symbol as PolygonSymbol3D;
    if (polygonSymbol && polygonSymbol.symbolLayers.length) {
      const symbolLayer = polygonSymbol.symbolLayers[0] as ExtrudeSymbol3DLayer;
      if (symbolLayer) {
        return symbolLayer.size;
      }
    }
    return 3;
  }

  private _applyBuildingSymbol(buildingGraphic: Graphic) {
    buildingGraphic.symbol = {
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
  }

  private _startDrawing(stories: number) {
    this.stories = stories;
    this.createPolygon(new Color("#d6bb7a"))
      .then((newBuilding) => this._applyBuildingSymbol(newBuilding));
  }

}

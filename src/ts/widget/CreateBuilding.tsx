/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import { renderable, tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";


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
                onclick={ this.startDrawing.bind(this, stories) }>{stories}-Story Building</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  public updateGraphic(graphic: Graphic): Promise<Graphic[]> {
    return this.updatePolygonGraphic(graphic, BUILDING_COLOR);
  }

  private startDrawing(stories: number) {

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
    this.createPolygonGraphic(symbol, color).finally(() => {
      this.stories = 0;
    });
    this.stories = stories;
  }

}

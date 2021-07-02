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
import { property, subclass } from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import { tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";


interface ColorMenu {
  label: string;
  color: string;
}

@subclass("app.draw.CreateArea")
export default class CreateArea extends DrawWidget {

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

  public postInitialize() {
    this.layer.elevationInfo = {
      mode: "on-the-ground",
    };
  }

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
                onclick={ this.startDrawing.bind(this, menu.color) }>Create {menu.label}</button>
            </div>
          )) }
        </div>
      </div>
    );
  }

  public updateGraphic(graphic: Graphic): Promise<Graphic[]> {
    return this.updatePolygonGraphic(graphic, graphic.symbol.color.toHex());
  }

  private startDrawing(color: string) {

    const symbol = new SimpleFillSymbol({
      color,
      outline: {
        width: 0,
      },
    });

    this.createPolygonGraphic(symbol, color).finally(() => {
      this.activeColor = null;
    }).catch(() => {
      // Ignore
    });
    this.activeColor = color;
  }

}

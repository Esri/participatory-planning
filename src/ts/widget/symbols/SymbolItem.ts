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
import Accessor from "esri/core/Accessor";
import { property, subclass } from "esri/core/accessorSupport/decorators";
import IconSymbol3DLayer = require("esri/symbols/IconSymbol3DLayer");
import EsriSymbol from "esri/symbols/Symbol";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";

@subclass("widgets.symbolgallery.SymbolItem")
export default class SymbolItem extends Accessor {

  @property({
    constructOnly: true,
  })
  public thumbnailHref: string;

  @property()
  public name: string;

  public webSymbol: WebStyleSymbol;

  private fetchPromise: Promise<EsriSymbol>;

  constructor(data: any, styleName: string) {
    super(data);
    this.thumbnailHref = data.thumbnail.href;
    this.webSymbol = new WebStyleSymbol({
      name: data.name,
      styleName,
    });
  }

  public fetchSymbol(): Promise<EsriSymbol> {
    if (!this.fetchPromise) {
      this.fetchPromise = this.webSymbol.fetchSymbol().then(
        (actualSymbol) => {

          // Add vertical offset to icon symbols as otherwise they vanish inside
          // extruded buildings where the ground is not even.

          if (actualSymbol.symbolLayers.length) {
            const symbolLayer = actualSymbol.symbolLayers.getItemAt(0);
            if (symbolLayer.type === "icon") {
              const icon = symbolLayer as IconSymbol3DLayer;
              icon.anchor = "relative";
              icon.anchorPosition = { x: 0, y: 0.6 };
              actualSymbol.verticalOffset = {
                screenLength: 20,
                maxWorldLength: 50,
                minWorldLength: 5,
              };
              actualSymbol.callout = {
                type: "line",
                color: [200, 200, 200],
                size: 0.8,
              } as any;

              return actualSymbol.clone();
            }
          }
          return actualSymbol;
        });
    }
    return this.fetchPromise;
  }

}

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
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import EsriSymbol from "esri/symbols/Symbol";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";

import SymbolGroup from "./SymbolGroup";

@subclass("widgets.symbolgallery.SymbolItem")
export default class SymbolItem extends declared(Accessor) {

  @property({
    constructOnly: true,
  })
  public thumbnailHref: string;

  @property()
  public group: SymbolGroup;

  @property()
  public name: string;

  public webSymbol: WebStyleSymbol;

  private fetchPromise: IPromise<EsriSymbol>;

  constructor(data: any, group: SymbolGroup) {
    super(data);
    this.group = group;
    this.thumbnailHref = data.thumbnail.href;
    this.webSymbol = new WebStyleSymbol({
      name: data.name,
      styleName: group.category,
    });
  }

  public fetchSymbol(): IPromise<EsriSymbol> {
    if (!this.fetchPromise) {
      this.fetchPromise = this.webSymbol.fetchSymbol().then((actualSymbol) => actualSymbol);
    }
    return this.fetchPromise;
  }

}

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
import Collection from "esri/core/Collection";
import PortalItem from "esri/portal/PortalItem";

import { SymbolGroupId } from "../SymbolGallery";
import SymbolItem from "./SymbolItem";

export const SymbolItemCollection = Collection.ofType<SymbolItem>(SymbolItem);

@subclass("draw.symbolgallery.SymbolGroup")
export default class SymbolGroup extends declared(Accessor) {

  @property({
    readOnly: true,
    type: SymbolItemCollection,
  })
  public readonly items = new SymbolItemCollection();

  @property()
  public title: string;

  private portalItem: PortalItem;

  private loadingPromise: IPromise;

  constructor(public category: SymbolGroupId, portalItem: PortalItem) {
    super(portalItem);
    this.portalItem = portalItem;
    this.title = portalItem.title;
  }

  public loadItems(): IPromise {
    if (!this.loadingPromise) {
      this.loadingPromise = this
        .fetchSymbolItems()
        .catch(console.error.bind("Failed to load symbols"));
    }
    return this.loadingPromise;
  }

  private fetchSymbolItems(): IPromise {
    return this.portalItem.fetchData().then((data) => {
      this.items.addMany(
        data.items
        //  .filter((symbolItem: any) => symbolItem.thumbnail.href && symbolItem.dimensionality === "volumetric")
          .map((symbolItem: any) => new SymbolItem(symbolItem, this)),
      );
    });
  }

}

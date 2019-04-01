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
        ._fetchSymbolItems()
        .then(() => console.log("Loaded symbols", this.title, this.items.length) )
        .catch((error) => console.error("Failed to load symbols", error) );
    }
    return this.loadingPromise;
  }

  private _fetchSymbolItems(): IPromise {
    console.log("Fetching symbol items", this.category);
    return this.portalItem.fetchData().then((data) => {
      this.items.addMany(
        data.items
        //  .filter((symbolItem: any) => symbolItem.thumbnail.href && symbolItem.dimensionality === "volumetric")
          .map((symbolItem: any) => new SymbolItem(symbolItem, this)),
      );
    });
  }

}

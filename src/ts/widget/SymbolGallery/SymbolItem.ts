import Accessor = require("esri/core/Accessor");
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

  private fetchPromise: IPromise<EsriSymbol>;

  constructor(data: any, group: SymbolGroup) {
    super(data);
    this.group = group;
    this.thumbnailHref = data.thumbnail.href;
  }

  public fetchSymbol(): IPromise<EsriSymbol> {
    if (!this.fetchPromise) {
      const webSymbol = new WebStyleSymbol({
        name: this.name,
        styleName: this.group.category,
      });
      this.fetchPromise = webSymbol.fetchSymbol().then((actualSymbol) => actualSymbol);
    }
    return this.fetchPromise;
  }

}

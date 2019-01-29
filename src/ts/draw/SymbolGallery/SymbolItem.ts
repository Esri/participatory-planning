import Accessor = require("esri/core/Accessor");
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
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

  @property()
  public symbol: WebStyleSymbol;

  constructor(data: any, group: SymbolGroup) {
    super(data);
    this.group = group;
    this.thumbnailHref = data.thumbnail.href;

    this.symbol = new WebStyleSymbol({
      name: data.name,
      styleName: group.category,
    });
  }

}

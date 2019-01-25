import Accessor = require("esri/core/Accessor");
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";

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

  constructor(data: any, group: SymbolGroup) {
    super(data);
    this.group = group;
    this.thumbnailHref = data.thumbnail.href;
  }

}

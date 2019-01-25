
import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import SymbolGallery from "./draw/SymbolGallery";
import Scene from "./Scene";

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {

  private scene: Scene = new Scene();

  private symbolGallery: SymbolGallery = new SymbolGallery({
      scene: this.scene,
  });

  public render() {
    return (
      <div>
        <div id="topMenu" />
        <div id="scene" bind={ this } afterCreate={ this._attachScene } />
        <div id="bottomMenu" class="center">
          <div id="secondaryMenu" class="menu secondary-menu">

          </div>
          <div class="menu primary-menu">
          {
            ["feature-layer", "line-chart", "organization", "map-pin"]
            .map((item) => (
              <div class="menuItem" onclick={ () => this._selectMenu(item) }>
                <span class={ "vcenter font-size-6 icon-ui-" + item } />
              </div>
            ))
          }
          </div>
        </div>
      </div>
    );
  }

  private _attachScene(element: HTMLDivElement) {
    this.scene.container = element;
  }

  private _selectMenu(item: string) {
    if (item === "map-pin") {
      this.symbolGallery.selectedGroup = null;
      this.symbolGallery.container = "secondaryMenu";
    }
  }

}

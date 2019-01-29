
import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import CreateBuilding from "./draw/CreateBuilding";
import SymbolGallery from "./draw/SymbolGallery";
import Scene from "./Scene";

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {

  private scene: Scene = new Scene();

  private activeWidget: Widget;

  private createBuilding: CreateBuilding = new CreateBuilding({
    scene: this.scene,
  });

  private symbolGallery: SymbolGallery = new SymbolGallery({
    scene: this.scene,
  });

  public render() {
    return (
      <div>
        <div id="topMenu" />
        <div id="scene" bind={ this } afterCreate={ this._attachScene } />
        <div class="bottom">
          <div id="secondaryMenu">

          </div>

          <div class="menu">
          {
            ["feature-layer", "line-chart", "organization", "map-pin"]
            .map((item) => (
              <div class="menu-item">
                <button class="btn btn-large" onclick={ () => this._selectMenu(item) }>
                  <span class={ "font-size-6 icon-ui-" + item } />
                </button>
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

    switch (item) {
      case "organization":
        this.createBuilding.container = "secondaryMenu";
        break;
      case "map-pin":
        this.symbolGallery.selectedGroup = null;
        this.symbolGallery.container = "secondaryMenu";
        break;
    }
  }

}


import {
  declared,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import Timeline from "./Timeline";

import CreateBuilding from "./draw/CreateBuilding";
import SymbolGallery from "./draw/SymbolGallery";
import Scene from "./Scene";

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {

  private scene: Scene = new Scene();

  private timeline: Timeline = new Timeline({
    scene: this.scene,
  });

  private createBuilding: CreateBuilding = new CreateBuilding({
    scene: this.scene,
  });

  private symbolGallery: SymbolGallery = new SymbolGallery({
    scene: this.scene,
  });

  private selectedWidget: Widget | null = null;

  public render() {
    return (
      <div>
        <div id="scene" afterCreate={ this._attachScene.bind(this) } />
        <div class="top">
          <div class="timeline" afterCreate={ this._attachTimeline.bind(this) } />
          <div class="perspective" />
        </div>
        <div class="bottom">
          <div id="secondaryMenu" class="secondary-menu">
            <div afterCreate={ this._attachMenu.bind(this, this.createBuilding) } />
            <div afterCreate={ this._attachMenu.bind(this, this.symbolGallery) } />
          </div>

          <div class="primary-menu">
            <div class="menu">
            {
              ["feature-layer", "line-chart", "organization", "map-pin"]
              .map((item) => (
                <div class="menu-item">
                  <button class="btn btn-large" onclick={ this._selectMenu.bind(this, item) }>
                    <span class={ "font-size-6 icon-ui-" + item } />
                  </button>
                </div>
              ))
            }
            </div>
          </div>
        </div>
        <div class="intro">
          <div class="column-17">
            <div class="card card-wide">
              <figure class="card-wide-image-wrap">
                <img class="card-wide-image" src="./images/dumbo.png" alt="Dumbo" />
                <div class="card-image-caption">
                  Dumbo, Brooklyn NY
                </div>
              </figure>
              <div class="card-content">
                <h4 class="trailer-half"><a href="#">Participatory Planning</a></h4>
                <p class="font-size--1 trailer-half">Wide cards are just like standard cards except that
                  they are displayed in landscape orientation. This is useful in situations where there
                  is too much content to display well in a standard card.</p>
                <p class="font-size--1 trailer-half">Generally wide cards are meant to be displayed one-up,
                  not grouped.</p>
                <button class="btn" onclick={ () => this.timeline.start() }>Start</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private _attachScene(element: HTMLDivElement) {
    this.scene.container = element;
  }

  private _attachTimeline(element: HTMLDivElement) {
    this.timeline.container = element;
  }

  private _attachMenu(menu: Widget, element: HTMLDivElement) {
    menu.container = element;
    this._hideWidget(menu);
  }

  private _selectMenu(item: string) {
    if (this.selectedWidget) {
      (this.selectedWidget.container as HTMLElement).style.display = "";
    }
    switch (item) {
      case "organization":
        this._showWidget(this.createBuilding);
        break;
      case "map-pin":
        this.symbolGallery.selectedGroup = null;
        this._showWidget(this.symbolGallery);
        break;
    }
  }

  private _hideWidget(widget: Widget) {
    (widget.container as HTMLElement).style.display = "none";
  }

  private _showWidget(widget: Widget) {
    if (this.selectedWidget) {
      this._hideWidget(this.selectedWidget);
    }
    this.selectedWidget = widget;
    (this.selectedWidget.container as HTMLElement).style.display = "";
  }

}

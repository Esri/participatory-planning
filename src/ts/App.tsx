
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import CreateArea from "./draw/CreateArea";
import CreateBuilding from "./draw/CreateBuilding";
import CreatePath from "./draw/CreatePath";
import DrawWidget from "./draw/DrawWidget";
import CreatePolygon from "./draw/operation/CreatePolygon";
import SymbolGallery from "./draw/SymbolGallery";
import Scene from "./Scene";
import Timeline from "./Timeline";

@subclass("app.widgets.webmapview")
export default class App extends declared(Widget) {

  @aliasOf("scene.map.portalItem.title")
  @renderable()
  public title: string;

  @property()
  public scene = new Scene();

  private timeline = new Timeline({
    scene: this.scene,
  });

  private createArea = new CreateArea({
    scene: this.scene,
  });

  private createPath = new CreatePath({
    scene: this.scene,
  });

  private createBuilding = new CreateBuilding({
    scene: this.scene,
  });

  private symbolGallery = new SymbolGallery({
    scene: this.scene,
  });

  private selectedWidget: DrawWidget | null = null;

  public postInitialize() {
    const view = this.scene.view;
    view.on("click", (event: any) => {
      if (event.mapPoint) {
        console.log("[" + event.mapPoint.x + ", " + event.mapPoint.y + "]");
      }

      if (!CreatePolygon.activeOperation) {
        view.hitTest(event)
        .then((response) => {
          // check if a feature is returned from the hurricanesLayer
          // do something with the result graphic
          response.results.forEach((result) => {
            const graphic = result.graphic;
            if (graphic) {
              console.log("Removing", response.results[0].graphic);
              const layer = graphic.layer as GraphicsLayer;
              if (layer) {
                layer.remove(graphic);
              }
            }
          });
        });
      }
    });
  }

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
            <div afterCreate={ this._attachMenu.bind(this, this.createArea) } />
            <div afterCreate={ this._attachMenu.bind(this, this.createPath) } />
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
                <h4 class="trailer-half"><a href="#">{ this.title }</a></h4>
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

  private _attachMenu(menu: DrawWidget, element: HTMLDivElement) {
    menu.container = element;
    this._hideWidget(menu);
  }

  private _selectMenu(item: string) {
    if (this.selectedWidget) {
      (this.selectedWidget.container as HTMLElement).style.display = "";
    }
    switch (item) {
      case "feature-layer":
        this._showWidget(this.createArea);
        break;
      case "line-chart":
        this._showWidget(this.createPath);
        break;
      case "organization":
        this._showWidget(this.createBuilding);
        break;
      case "map-pin":
        this.symbolGallery.selectedGroup = null;
        this._showWidget(this.symbolGallery);
        break;
    }
  }

  private _hideWidget(widget: DrawWidget) {
    (widget.container as HTMLElement).style.display = "none";
  }

  private _showWidget(widget: DrawWidget) {
    if (this.selectedWidget) {
      this._hideWidget(this.selectedWidget);
    }
    this.selectedWidget = widget;
    (this.selectedWidget.container as HTMLElement).style.display = "";
  }

}

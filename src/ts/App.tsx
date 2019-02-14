
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { whenNotOnce } from "esri/core/watchUtils";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { renderable, tsx } from "esri/widgets/support/widget";

import Scene from "./Scene";
import Timeline from "./Timeline";
import CreateArea from "./widget/CreateArea";
import CreateBuilding from "./widget/CreateBuilding";
import CreatePath from "./widget/CreatePath";
import DrawWidget from "./widget/DrawWidget";
import GlTFWidget from "./widget/GlTFWidget";
import SymbolGallery from "./widget/SymbolGallery";
import WidgetBase from "./widget/WidgetBase";

import UpdateOperation from "./widget/operation/UpdateOperation";
import Graphic = require('esri/Graphic');

const scene = new Scene();

@subclass("app.widgets.webmapview")
export default class App extends declared(WidgetBase) {

  @aliasOf("scene.map.portalItem.title")
  @renderable()
  public title: string;

  private timeline = new Timeline({scene});

  private createArea = new CreateArea({scene});

  private createPath = new CreatePath({scene});

  private createBuilding = new CreateBuilding({scene});

  private symbolGallery = new SymbolGallery({scene});

  private glTFWidget = new GlTFWidget({scene});

  @property()
  private selectedWidget: DrawWidget | null = null;

  private drawWidgets = [this.createArea, this.createPath, this.createBuilding, this.symbolGallery, this.glTFWidget];

  public constructor() {
    super();
    this.scene = scene;
  }

  public postInitialize() {
    const view = this.scene.view;
    view.on("click", (event: any) => {
      if (event.mapPoint) {
        console.log("[" + event.mapPoint.x + ", " + event.mapPoint.y + "]");
      }

      if (!this.scene.currentOperation) {
        view.hitTest(event)
        .then((response) => {
          // check if a feature is returned from the hurricanesLayer
          // do something with the result graphic
          response.results.forEach((result) => {
            const graphic = result.graphic;
            if (graphic && graphic.geometry) {
              this._updateGraphic(graphic);
            }
          });
        });
      }
    });

    // Leave a reference of the view on the window for debugging
    (window as any).app = this;
  }

  public render() {
    return (
      <div>
        <div id="scene" afterCreate={ this._attachScene.bind(this) } />

        <div class="box">
          <div class="top">
            <div class="timeline" afterCreate={ this._attachTimeline.bind(this) } />
          </div>
          <div class="content">
            <div afterCreate={ this._attachMenu.bind(this, this.createArea) } />
            <div afterCreate={ this._attachMenu.bind(this, this.createPath) } />
            <div afterCreate={ this._attachMenu.bind(this, this.createBuilding) } />
            <div afterCreate={ this._attachMenu.bind(this, this.symbolGallery) } />
            <div afterCreate={ this._attachMenu.bind(this, this.glTFWidget)} />
          </div>
          <div class="bottom">
            <div class="menu">
            {
              ["feature-layer", "line-chart", "organization", "map-pin", "upload"]
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

        <div id="overlay" class="center" />
        <div id="loadingIndicator" class="center" afterCreate={ () => this.toggleLoadingIndicator(true) }>
          <div class="loader-bars"></div>
          <div class="loader-text text-white" id="loadingIndicatorText"></div>
        </div>
        <div id="intro" class="center">
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
                <button class="btn" onclick={ () => this._start() }>Start</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  protected toggleIntro(show: boolean) {
    this.toggleElement("intro", show);
  }

  private _start() {
    this.toggleIntro(false);

    whenNotOnce(this.scene.view, "updating").then(() => {
      this.toggleOverlay(false);
      this.toggleLoadingIndicator(false);
      this.timeline.start();
    });
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
        this.symbolGallery.reset();
        this._showWidget(this.symbolGallery);
        break;
      case "upload":
        this.glTFWidget.startImport();
        this._showWidget(this.glTFWidget);
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

  private _updateGraphic(graphic: Graphic) {
    console.log("Editing", graphic);
    const layer = graphic.layer as GraphicsLayer;
    if (layer) {
      this.drawWidgets.some((widget) => {
        if (widget.layer === layer) {
          widget.updateGraphic(graphic);
          return true;
        }
        return false;
      });
    }
  }

}


import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { renderable, tsx } from "esri/widgets/support/widget";

import Scene from "./Scene";
import Timeline from "./Timeline";
import CreateArea from "./widget/CreateArea";
import CreateBuilding from "./widget/CreateBuilding";
import CreatePath from "./widget/CreatePath";
import DrawWidget from "./widget/DrawWidget";
import GlTFWidget from "./widget/GlTFWidget";
import SymbolGallery, { SymbolGroupId } from "./widget/SymbolGallery";
import WidgetBase from "./widget/WidgetBase";

const scene = new Scene();

interface MainMenu {
  label: string;
  iconName: string;
  onClick: () => void;
}

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

  private mainMenuEntries: MainMenu[] = [];

  public constructor() {
    super();
    this.scene = scene;
  }

  public postInitialize() {
    const view = this.scene.view;
    view.on("click", (event: any) => {
      if (event.mapPoint) {
        console.log("[" + event.mapPoint.x + ", " + event.mapPoint.y + "]", event);
      }

      if (!this.scene.currentOperation) {
        view.hitTest(event)
        .then((response) => {
          // check if a feature is returned from the hurricanesLayer
          // do something with the result graphic
          console.log("hitTest", response.results);
          response.results.some((result) => {
            const graphic = result.graphic;
            if (graphic && graphic.geometry) {
              this._updateGraphic(graphic);
              return true;
            }
            return false;
          });
        });
      }
    });

    this.mainMenuEntries.push({
      label: "Ground",
      iconName: "feature-layer",
      onClick: this._showWidget.bind(this, this.createArea),
    });
    this.mainMenuEntries.push({
      label: "Paths",
      iconName: "line-chart",
      onClick: this._showWidget.bind(this, this.createPath),
    });
    this.mainMenuEntries.push({
      label: "Buildings",
      iconName: "organization",
      onClick: this._showWidget.bind(this, this.createBuilding),
    });
    this.mainMenuEntries.push({
      label: "Icons",
      iconName: "map-pin",
      onClick: this._showSymbolGallery.bind(this, SymbolGroupId.Icons),
    });
    this.mainMenuEntries.push({
      label: "Trees",
      iconName: "map-pin",
      onClick: this._showSymbolGallery.bind(this, SymbolGroupId.Trees),
    });
    this.mainMenuEntries.push({
      label: "Vehicles",
      iconName: "map-pin",
      onClick: this._showSymbolGallery.bind(this, SymbolGroupId.Vehicles),
    });
    this.mainMenuEntries.push({
      label: "glTF",
      iconName: "upload",
      onClick: () => {
        this.glTFWidget.startImport();
        this._showWidget(this.glTFWidget);
      },
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
            <div afterCreate={ this._attachTimeline.bind(this) } />
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
              this.mainMenuEntries.map((entry) => (
                <div class="menu-item">
                  <button class="btn" onclick={ entry.onClick }>
                    <span class={ "font-size-3 icon-ui-" + entry.iconName } /><br />
                    { entry.label }
                  </button>
                </div>
              ))
            }
            </div>
          </div>
        </div>

        <div id="overlay" class="center" />
        <div id="loadingIndicator" class="center hide"
          afterCreate={ () => this.toggleLoadingIndicator(true) }>
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
                <h4 class="trailer-half">{ this.title }</h4>
                <p class="font-size--1 trailer-half">
                  <ul>
                    <li>When creating shapes, either double click or press <code>C</code> to complete.</li>
                    <li>Press <code>Del</code> or <code>Backspace</code> to remove a selected object.</li>
                    <li>Press <code>Escape</code> to revert a current editing.</li>
                  </ul>
                </p>
                <div menu>
                  <button class="menu-item btn btn-grouped"
                    onclick={ () => this.timeline.startIntro() }>Start Planning</button>
                  <button class="menu-item btn btn-transparent btn-grouped"
                    onclick={ () => this.timeline.continueEditing() }>Skip Animation</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="screenshot" class="center hide">
          <div>
            <img id="screenshotImage" />
          </div>
          <div class="menu">
          <div class="menu-item">
            <button class="btn" onclick={ () => this.timeline.continueEditing() }>
              Back
            </button>
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

  private _hideWidget(widget: DrawWidget) {
    (widget.container as HTMLElement).style.display = "none";
  }

  private _showWidget(widget: DrawWidget) {
    if (this.selectedWidget) {
      this._hideWidget(this.selectedWidget);
      if (this.selectedWidget === widget) {
        this.selectedWidget = null;
        return;
      }
    }
    this.selectedWidget = widget;
    (this.selectedWidget.container as HTMLElement).style.display = "";
  }

  private _showSymbolGallery(groupId: SymbolGroupId) {
    if (this.symbolGallery.selectedGroupId !== groupId) {
      this.symbolGallery.selectedGroupId = groupId;
      if (this.selectedWidget === this.symbolGallery) {
        return;
      }
    }
    this._showWidget(this.symbolGallery);
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

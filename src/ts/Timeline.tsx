
// esri
import Color from "esri/Color";
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import { eachAlways } from "esri/core/promiseUtils";
import { whenNotOnce } from "esri/core/watchUtils";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import Layer from "esri/layers/Layer";
import Slide from "esri/webscene/Slide";
import {
  renderable,
  tsx,
} from "esri/widgets/support/widget";

// animejs
import anime from "animejs";

import {MASK_AREA} from "./Scene";
import { dojoPromise } from "./support/promises";
import "./widget/support/extensions";
import WidgetBase from "./widget/WidgetBase";

export const AREA_ANIMATION_DURATION = 2000;
export const MASK_ANIMATION_DURATION = 1000;

const maskPolygonSymbol = (color: Color): any => {
  return {
    type: "simple-fill",
    color,
    outline: {
      width: 0,
    },
  };
};

@subclass("app.widgets.Timeline")
export default class Timeline extends declared(WidgetBase) {

  private vectorTileLayer: Layer | null = null;

  @renderable()
  @aliasOf("scene.map.presentation.slides")
  private slides: Collection<Slide>;

  private screenshotSlide: Slide;

  private maskColor = new Color([226, 119, 40]);

  private maskPolyline = new Graphic({
    geometry: {
      type: "polyline",
      paths: [[0, 0], [1, 1]],
      spatialReference: SpatialReference.WebMercator,
    },
    symbol: {
      type: "line-3d",
      symbolLayers: [{
        type: "line",
        size: 6,
        material: { color: this.maskColor },
      }],
    },
    } as any);

  private maskPolygon = new Graphic({
    symbol: maskPolygonSymbol(this.maskColor.withAlpha(0)),
  } as any);

  public postInitialize() {

    this.scene.map.when(() => {
      this.scene.map.layers.some((layer) => {
        if (layer.type === "vector-tile") {
          this.vectorTileLayer = layer;
          return true;
        }
      });

      this.maskPolygon.geometry = this.scene.maskPolygon;

      this.scene.sketchLayer.add(this.maskPolyline);
      this.scene.sketchLayer.add(this.maskPolygon);

      this.scene.map.ground.surfaceColor = new Color("#f0f0f0");

      this._showIntro();
    });

    this.toggleElement("screenshot", false);
  }

  public render() {

    const slides = this.slides.slice(1).toArray();

    console.log("Slides", slides);

    return (
      <div class="timeline">
        <div class="menu menu-left phone-hide">
          <div class="menu-item">
            <button class="btn btn-large" onclick={ this._showIntro.bind(this) }>
              Intro
            </button>
          </div>
        </div>
        <div class="menu phone-hide">
          { slides.map((slide) => (<div class="menu-item" key={ slide.id }>
              <button class="btn btn-large" onclick={ () => this._goToSlide(slide) }>
                { slide.title.text }
              </button>
            </div>)) }
        </div>
        <div class="menu menu-right">
          <div class="menu-item">
            <button class="btn btn-large" onclick={ this._takeScreenshot.bind(this) }>
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  public startIntro(): IPromise {
    this.toggleElement("intro", false);
    return this
      ._goToSlide(this.slides.getItemAt(0))
      .then(() => {
        this.toggleOverlay(false);
        this.toggleLoadingIndicator(false);
      })
      .then(() => this._showFirstEditSlide())
      .then(() => this._animateArea())
      .then(() => this._animateMask())
      .then(() => this._toggleBasemap(false));
  }

  public continueEditing() {
    this.toggleOverlay(false);
    this.toggleLoadingIndicator(false);
    this.toggleElement("intro", false);
    this.toggleElement("screenshot", false);
    this._showFirstEditSlide();
    this._toggleBasemap(false);
  }

  private _showIntro(): IPromise {
    this.toggleLoadingIndicator(true);
    return this._goToSlide(this.slides.getItemAt(0))
      .then(() => {
        this._toggleBasemap(true);
        this.toggleElement("intro", true);
      });
  }

  private _showFirstEditSlide(): IPromise {
    return this
      ._goToSlide(this.slides.getItemAt(1))
      .then(() => this.scene.showMaskedBuildings());
  }

  private _takeScreenshot(): IPromise {
    this.toggleLoadingIndicator(true);
    return this
      ._goToSlide(this.screenshotSlide)
      .then(() => this.scene.view.takeScreenshot({
        format: "png",
        width: this.scene.view.width / 2,
      }))
      .then((screenshot) => this._showScreenshot(screenshot));
  }

  private _showScreenshot(screenshot: __esri.Screenshot) {
    const element = document.getElementById("screenshotImage") as HTMLImageElement;
    element.src = screenshot.dataUrl;
    this.toggleLoadingIndicator(false);
    this.toggleOverlay(true);
    this.toggleElement("screenshot", true);
  }

  private _goToSlide(slide: Slide): IPromise {
    const view = this.scene.view;
    return view.goTo(slide.viewpoint, { duration: 5000 }).then(() => {

      view.set("environment.lighting.ambientOcclusionEnabled", true);

      // Wait for all layers to update after applying a new slide
      return eachAlways(view.allLayerViews.map((layerView) => {
        return whenNotOnce(layerView, "updating");
      }));
    });
  }

  private _animateArea(): IPromise<void> {

    const start = MASK_AREA[0];
    const waypoints = MASK_AREA.slice(1);
    waypoints.push(start);

    const durations: number[] = [];
    let totalLength = 0;

    waypoints.forEach((point, index) => {
      const a = point[0] - MASK_AREA[index][0];
      const b = point[1] - MASK_AREA[index][1];
      const length = Math.sqrt(a * a + b * b); // Math.abs(a * b);
      durations.push(length);
      totalLength += length;
    });

    durations.forEach((duration, index) => {
      durations[index] = duration * AREA_ANIMATION_DURATION / totalLength;
    });

    const paths = [start];

    const movingPoint = {
      x: start[0],
      y: start[1],
    };

    let timeline = anime.timeline({
      update: () => {
        if (paths.length) {
          this.maskPolyline.geometry = {
            type: "polyline",
            paths: [paths.concat([[movingPoint.x, movingPoint.y]])],
            spatialReference: SpatialReference.WebMercator,
          } as any;
        }
      },
    });
    waypoints.forEach((point, index) => {
      timeline = timeline.add({
        targets: movingPoint,
        x: point[0],
        y: point[1],
        duration: durations[index],
        easing: "easeInOutCubic",
        complete: () => {
          paths.push([movingPoint.x, movingPoint.y]);
        },
      });
    });
    return dojoPromise(timeline.finished);
  }

  private _animateMask(): IPromise<void> {
    const color = new Color({
      r: 226,
      g: 119,
      b: 40,
      a: 0,
    });

    const buildingColor = new Color({
      r: 256,
      g: 256,
      b: 256,
    });

    const timeline = anime.timeline({
      update: () => {
        this.maskPolygon.symbol = maskPolygonSymbol(color);
        this.scene.showMaskedBuildings(buildingColor);
      },
    }).add({
      targets: [color, buildingColor],
      r: 226,
      g: 119,
      b: 40,
      a: 0.6,
      duration: MASK_ANIMATION_DURATION / 2,
      easing: "easeInOutCubic",
    }).add({
      targets: [color, buildingColor],
      a: 0,
      delay: 100,
      duration: MASK_ANIMATION_DURATION / 2,
      endDelay: 1500,
      easing: "easeInOutCubic",
    });
    return dojoPromise(timeline.finished);
  }

  private _toggleBasemap(show: boolean) {
    this.scene.map.basemap = (show ? "satellite" : null) as any;
    this.vectorTileLayer.visible = !show;
  }

}

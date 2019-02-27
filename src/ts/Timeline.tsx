
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
import Polyline = require('esri/geometry/Polyline');

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

const EMPTY_POLYLINE = new Polyline({
  paths: [[[0, 0], [1, 1]]],
  spatialReference: SpatialReference.WebMercator,
});

@subclass("app.widgets.Timeline")
export default class Timeline extends declared(WidgetBase) {

  private vectorTileLayer: Layer;

  @renderable()
  @aliasOf("scene.map.presentation.slides")
  private slides: Collection<Slide>;

  private maskColor = new Color([226, 119, 40]);

  private maskPolyline = new Graphic({
    geometry: EMPTY_POLYLINE,
    symbol: {
      type: "line-3d",
      symbolLayers: [{
        type: "line",
        size: 6,
        material: { color: this.maskColor },
      }],
    },
    } as any);

  private maskPolygon: Graphic;

  private showIntroDialog = true;

  public postInitialize() {

    const queryParams = document.location.search.substr(1);
    this.showIntroDialog = queryParams !== "skipTutorial";

    this.scene.map.when(() => {
      this.scene.map.layers.some((layer) => {
        if (layer.type === "vector-tile") {
          this.vectorTileLayer = layer;
          return true;
        }
      });

      this.maskPolygon = new Graphic({
        symbol: maskPolygonSymbol(this.maskColor.withAlpha(0)),
        geometry: this.scene.maskPolygon,
      } as any);

      this.scene.sketchLayer.add(this.maskPolyline);
      this.scene.sketchLayer.add(this.maskPolygon);

      this.scene.map.ground.surfaceColor = new Color("#f0f0f0");

      this._showIntro();
    });

    this.toggleElement("screenshot", false);
  }

  public render() {

    const slides = this.slides.slice(2).toArray();

    return (
      <div class="timeline">
        <div class="menu menu-left phone-hide">
          <div class="menu-item">
          { this.showIntroDialog ? (
            <button class="btn btn-large" onclick={ this._showIntro.bind(this) }>
              New
            </button>
          ) : (
            <button class="btn btn-large" onclick={ this.playIntroAnimation.bind(this) }>
              Intro
            </button>
          )}
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
              Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  public playIntroAnimation(): IPromise {
    this.toggleElement("intro", false);
    return this
      ._waitForSceneToUpdate()
      .then(() => {
        this.toggleOverlay(false);
        this.toggleLoadingIndicator(false);
      })
      .then(() => this._goToSlide(this.slides.getItemAt(1), 1500))
      .then(() => this._animateArea())
      .then(() => this._animateMask())
      .then(() => this._goToSlide(this.slides.getItemAt(2)))
      .then(() => this._toggleBasemap(false));
  }

  public startPlanning() {
    this.toggleOverlay(false);
    this.toggleLoadingIndicator(false);
    this.toggleElement("intro", false);
    this.toggleElement("screenshot", false);
    this._showFirstEditSlide();
    this._toggleBasemap(false);
  }

  private _showIntro(): IPromise {
    this.toggleLoadingIndicator(true);
    this.scene.showMaskedBuildings("white");
    this.scene.clear();
    return this._goToSlide(this.slides.getItemAt(0))
      .then(() => {
        this._toggleBasemap(true);
        if (this.showIntroDialog) {
          this.toggleElement("intro", true);
        } else {
          this.toggleElement("intro", false);
          this.toggleLoadingIndicator(false);
        }
      });
  }

  private _showFirstEditSlide(): IPromise {
    return this
      ._goToSlide(this.slides.getItemAt(2))
      .then(() => this.scene.showMaskedBuildings());
  }

  private _takeScreenshot() {
    const view = this.scene.view;
    const options = { format: "png", width: this.scene.view.width / 2 };
    this.toggleLoadingIndicator(true);

    setTimeout(() => {
      this._waitForSceneToUpdate()
        .then(() => view.takeScreenshot(options))
        .then((after) => {
          this.scene.showTexturedBuildings();
          this._toggleBasemap(true);
          setTimeout(() => {
            this._waitForSceneToUpdate()
              .then(() => view.takeScreenshot(options))
              .then((before) => {
                this._showScreenshot(before, after);

                this.scene.showMaskedBuildings();
                this._toggleBasemap(false);
              });
          }, 100);
        });
    }, 100);
  }

  private _showScreenshot(before: __esri.Screenshot, after: __esri.Screenshot) {
    const canvas = document.getElementById("screenshotCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.height = before.data.height;
    canvas.width = before.data.width + after.data.width;
    context.putImageData(before.data, 0, 0);
    context.putImageData(after.data, before.data.width, 0);

    context.font = "30px Arial";
    context.fillStyle = "white";
    context.fillText("Before", 15, before.data.height - 20);
    context.fillText("After", before.data.width + 15, before.data.height - 20);

    this.toggleLoadingIndicator(false);
    this.toggleOverlay(true);
    this.toggleElement("screenshot", true);
  }

  private _waitForSceneToUpdate(): IPromise {
    return eachAlways(this.scene.view.allLayerViews.map((layerView) => {
      return whenNotOnce(layerView, "updating");
    }));
  }

  private _goToSlide(slide: Slide, duration = 800): IPromise {
    const view = this.scene.view;
    return view.goTo(slide.viewpoint, { duration }).then(() => {

      view.set("environment.lighting.ambientOcclusionEnabled", true);
      view.set("environment.lighting.date", "Thu Jun 20 2019 11:40:00 GMT-0500");

      // Wait for all layers to update after applying a new slide
      return this._waitForSceneToUpdate();

      // Catching any exceptions in case animation gets canceled
    }).catch(console.log);
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
      complete: () => {
        this.maskPolyline.geometry = EMPTY_POLYLINE;
      },
    });
    return dojoPromise(timeline.finished);
  }

  private _toggleBasemap(show: boolean): IPromise {
    this.scene.map.basemap = (show ? "satellite" : null) as any;
    this.vectorTileLayer.visible = !show;
    return this._waitForSceneToUpdate();
  }

}

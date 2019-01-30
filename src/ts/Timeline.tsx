
import Scene, {MASK_AREA} from "./Scene";

// esri
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import { eachAlways } from "esri/core/promiseUtils";
import { whenNotOnce } from "esri/core/watchUtils";
import Point from "esri/geometry/Point";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import Draw from "esri/views/draw/Draw";
import Slide from "esri/webscene/Slide";

// animejs
import anime from "animejs";
import Polyline = require('esri/geometry/Polyline');
import Color = require('esri/Color');
import SimpleFillSymbol = require('esri/symbols/SimpleFillSymbol');

export const MASK_ANIMATION_DURATION = 2000;

@subclass("app.widgets.Timeline")
export default class Timeline extends declared(Widget) {

  @property()
  public scene: Scene;

  private introSlide: Slide;
  private beforeSlide: Slide;
  private afterSlide: Slide;

  private maskColor = new Color([226, 119, 40]);

  private maskPolyline: Graphic;

  private maskPolygon: Graphic;

  constructor(params?: any) {
    super(params);
  }

  public postInitialize() {
    this.scene.map.when(() => {
      const slides = this.scene.map.presentation.slides;
      this.introSlide = slides.getItemAt(0);
      this.beforeSlide = slides.getItemAt(1);
      this.afterSlide = slides.getItemAt(2);

      this.maskPolyline = new Graphic({
        symbol: {
          type: "line-3d", // autocasts as SimpleLineSymbol()
          symbolLayers: [{
            type: "path",  // autocasts as new PathSymbol3DLayer()
            size: 6,  // 20 meters in diameter
            material: { color: this.maskColor },
          }],
        },
      } as any);

      this.maskPolygon = new Graphic({
        geometry: this.scene.maskPolygon,
        symbol: {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: this.maskColor,
          outline: { // autocasts as new SimpleLineSymbol()
            width: 6,
            color: this.maskColor,
          },
        },
      } as any);
    });

    this.scene.view.when(() => {
      this._goToSlide(this.introSlide);
    });
  }

  public render() {
    return (
      <div>
        <div class="menu">
            <div class="menu-item">
              <button class="btn btn-large" onclick={ this._showIntro.bind(this) }>
                Intro
              </button>
            </div>
            <div class="menu-item">
              <button class="btn btn-large" onclick={ this._showBefore.bind(this) }>
                Before
              </button>
            </div>
            <div class="menu-item">
              <button class="btn btn-large" onclick={ this._showAfter.bind(this) }>
                After
              </button>
            </div>
        </div>
      </div>
    );
  }

  public start() {
    (document.getElementsByClassName("intro")[0] as any).style.visibility = "hidden";
    this._showIntro();
  }

  private _showIntro(): IPromise {
    this.scene.highlightLayer.graphics.remove(this.maskPolyline);
    this.scene.highlightLayer.graphics.remove(this.maskPolygon);
    return this._showBefore()
    .then(() => {
      this
        ._animateArea()
        .then(() => this._animateMask())
        .then(() => this._showAfter());
    });
  }

  private _showBefore(): IPromise {
    return this
      ._goToSlide(this.beforeSlide)
      .then(() => this.scene.showMaskedBuildings("white"));
  }

  private _showAfter(): IPromise {
    this.scene.showMaskedBuildings();
    return this
      ._goToSlide(this.afterSlide);
  }

  private _goToSlide(slide: Slide): IPromise {
    const view = this.scene.view;
    return view.goTo(slide.viewpoint).then(() => {

      this.scene.view.environment = slide.environment;

      // Toggle layer visibility
      this.scene.map.layers.forEach((layer) => {
        if (!layer.visible) {
          layer.visible = true;
        }
        if (layer.get("url")) {
          let opacity = 1;
          if (slide.visibleLayers.findIndex((visibleLayer) => visibleLayer.id === layer.id) < 0) {
            opacity = 0.01;
          }
          if (layer.opacity !== opacity) {
            layer.opacity = opacity;
          }
        }
      });

      // Wait for all layers to update after applying a new slide
      return eachAlways(view.layerViews.map((layerView) => {
        return whenNotOnce(layerView, "updating");
      }));
    });
  }

  private _animateArea(): Promise<void> {

    const start = MASK_AREA[0];
    const waypoints = MASK_AREA.slice(1);

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
      durations[index] = duration * MASK_ANIMATION_DURATION / totalLength;
    });

    const paths = [start];

    const movingPoint = {
      x: start[0],
      y: start[1],
    };

    const layer = this.scene.highlightLayer;

    let timeline = anime.timeline({
      update: () => {
        layer.remove(this.maskPolyline);
        const clonedMaskPolygon = this.maskPolyline.clone();
        clonedMaskPolygon.symbol = this.maskPolyline.symbol;
        clonedMaskPolygon.geometry = new Polyline({
          paths: [paths.concat([[movingPoint.x, movingPoint.y]])],
          spatialReference: SpatialReference.WebMercator,
        } as any);
        this.maskPolyline = clonedMaskPolygon;
        layer.add(clonedMaskPolygon);
      },
    });
    waypoints.forEach((point, index) => {
      timeline = timeline.add({
        targets: movingPoint,
        x: point[0],
        y: point[1],
        duration: durations[index],
        easing: "easeInOutExpo",
        complete: () => {
          paths.push([movingPoint.x, movingPoint.y]);
        },
      });
    });
    return timeline.finished;
  }

  private _animateMask(): Promise<void> {
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

    const layer = this.scene.highlightLayer;

    const update = () => {
      // Graphic is only redrawn when symbol changes
      const clone = this.maskPolygon.clone();
      layer.remove(this.maskPolygon);
      clone.symbol = (this.maskPolygon.symbol as SimpleFillSymbol).clone();
      clone.symbol.color = color;
      layer.add(clone);
      this.maskPolygon = clone;
    };

    return anime({
      update: () => {
        update();
        this.scene.showMaskedBuildings(buildingColor);
      },
      targets: [color, buildingColor],
      r: 226,
      g: 119,
      b: 40,
      a: 0.6,
      easing: "easeInOutExpo",
    }).finished
    .then(() =>
      anime({
        targets: color,
        a: 0,
        delay: 500,
        duration: 500,
        endDelay: 1500,
        easing: "easeInOutExpo",
        update,
        begin: () => {
          this.scene.showMaskedBuildings();
        },
        complete: () => {
          layer.remove(this.maskPolygon);
        },
      }).finished,
    );
  }

}

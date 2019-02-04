
// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { eachAlways } from "esri/core/promiseUtils";
import { whenNotOnce } from "esri/core/watchUtils";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import Slide from "esri/webscene/Slide";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

// animejs
import anime from "animejs";

import Scene, {MASK_AREA} from "./Scene";
import { redraw } from "./support/graphics";

export const AREA_ANIMATION_DURATION = 2000;
export const MASK_ANIMATION_DURATION = 1000;

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
          type: "line-3d",
          symbolLayers: [{
            type: "path",
            size: 6,
            material: { color: this.maskColor },
          }],
        },
      } as any);
      this.scene.highlightLayer.add(this.maskPolyline);

      this.maskPolygon = new Graphic({
        geometry: this.scene.maskPolygon,
        symbol: {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: this.maskColor.clone().setColor({a: 0}),
          outline: { // autocasts as new SimpleLineSymbol()
            width: 6,
            color: this.maskColor,
          },
        },
      } as any);
      this.scene.highlightLayer.add(this.maskPolygon);
    });

    this.scene.view.when(() => {
      // this._goToSlide(this.introSlide);

      // Remove this for initial animation
      this._showAfter();
      (document.getElementsByClassName("intro")[0] as any).style.visibility = "hidden";
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

      view.environment = slide.environment;

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
      return eachAlways(view.allLayerViews.map((layerView) => {
        return whenNotOnce(layerView, "updating");
      }));
    });
  }

  private _animateArea(): Promise<void> {

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
        this.maskPolyline = redraw(this.maskPolyline, "geometry", {
          type: "polyline",
          paths: [paths.concat([[movingPoint.x, movingPoint.y]])],
          spatialReference: SpatialReference.WebMercator,
        });
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

    const polylinecolor = color.clone();

    return anime.timeline({
      update: () => {
        this.maskPolygon = redraw(this.maskPolygon, "symbol.color", color);
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
      targets: [color, buildingColor, polylinecolor],
      a: 0,
      delay: 100,
      duration: MASK_ANIMATION_DURATION / 2,
      endDelay: 1500,
      easing: "easeInOutCubic",
    }).finished;
  }

}

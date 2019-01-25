import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";

// esri
import Color from "esri/Color";
import { eachAlways } from "esri/core/promiseUtils";
import { whenNotOnce } from "esri/core/watchUtils";
import Polyline from "esri/geometry/Polyline";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneLayer from "esri/layers/SceneLayer";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SceneView from "esri/views/SceneView";
import WebScene from "esri/WebScene";
import Slide from "esri/webscene/Slide";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

// animejs
import anime from "animejs";

// Hard coded constants

const MASKED_OBJIDS = [
  158321, 106893, 158711, 158613, 158632, 159047, 158099, 158249, 147102, 106899, 107439, 158654, 158247, 158307,
  158610, 158963, 154542, 158869, 158814, 158900, 107340, 107395, 107172, 158336, 158784, 158571, 158600, 158348,
  158955, 158205, 158883, 158431, 158326, 158353, 158449, 158587, 158251, 158857, 159069, 158706,
];

const MASK_ANIMATION_DURATION = 2000;

const MASKED_AREA = [
  [-8235924.058660398, 4968738.274357371],
  [-8235409.000644938, 4968717.325404106],
  [-8235333.439527529, 4968898.289607817],
  [-8235295.877979361, 4969109.891441089],
  [-8236134.357229519, 4969027.878528339],
  [-8236138.632189713, 4968850.261903069],
  [-8235919.081131686, 4968836.806196137],
  [-8235924.058660398, 4968738.274357371],
];

@subclass("app.widgets.webmapview")
export default class Scene extends declared(Widget) {

  public readonly map: WebScene = new WebScene({
    portalItem: {
      id: "8dd394c07205432bad112c21cbbc307f",
    },
  });

  @property({
    readOnly: true,
  })
  public readonly view: SceneView = new SceneView({
    map: this.map,
    ui: {
      components: [],
    },
  } as any);

  private sceneLayer: SceneLayer;

  private graphicsLayer: GraphicsLayer = new GraphicsLayer({
    visible: true,
  });

  public postInitialize() {

    this.map.when(() => {
      this.map.add(this.graphicsLayer);
      this.sceneLayer = this.map.layers.find((layer) => layer.type === "scene") as SceneLayer;
    });

    this.view.on("click", (event) => {
        console.log("Clicked", event.mapPoint.x, event.mapPoint.y);
    });

    // Leave a reference of the view on the window for debugging
    (window as any).view = this.view;
  }

  public render() {
    return (
      <div>
        <div id="sceneView" bind={ this } afterCreate={ this._attachSceneView } />
        <div id="sceneSlides" class="scene-slides" bind={ this } afterCreate={ this._attachSlides }></div>
      </div>
    );
  }

  private _attachSceneView(sceneViewDiv: HTMLDivElement) {
    this.view.container = sceneViewDiv;
  }

  private _animateArea(): Promise<void> {

    const start = MASKED_AREA[0];
    const waypoints = MASKED_AREA.slice(1);

    const durations: number[] = [];
    let totalLength = 0;

    waypoints.forEach((point, index) => {
      const a = point[0] - MASKED_AREA[index][0];
      const b = point[1] - MASKED_AREA[index][1];
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

    const polylineGraphic = new Graphic({
      symbol: {
        type: "line-3d", // autocasts as SimpleLineSymbol()
        symbolLayers: [{
          type: "path",  // autocasts as new PathSymbol3DLayer()
          size: 4,  // 20 meters in diameter
          material: { color: [226, 119, 40] },
        }],
      },
    } as any);

    this.graphicsLayer.removeAll();
    this.sceneLayer.definitionExpression = "";

    this.graphicsLayer.add(polylineGraphic);

    let timeline = anime.timeline({}).add({
      targets: movingPoint,
      delay: 1000,
    });
    waypoints.forEach((point, index) => {
      timeline = timeline.add({
        targets: movingPoint,
        x: point[0],
        y: point[1],
        duration: durations[index], // durations[i],
        easing: "easeInOutExpo",
        update: () => {
          polylineGraphic.geometry = new Polyline({
            paths: [paths.concat([[movingPoint.x, movingPoint.y]])],
            spatialReference: SpatialReference.WebMercator,
          } as any);
          this.graphicsLayer.add(polylineGraphic);
        },
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

    const polygonGraphic = new Graphic({
      geometry: {
        type: "polygon", // autocasts as new Polygon()
        rings: MASKED_AREA,
        spatialReference: SpatialReference.WebMercator,
      },
      symbol: {
        color,
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        outline: { // autocasts as new SimpleLineSymbol()
          width: 4,
          color: [226, 119, 40],
        },
      },
    } as any);

    this.graphicsLayer.add(polygonGraphic);

    return anime
      .timeline({
        update: () => {
          // Graphic is only redrawn when symbol changes
          polygonGraphic.symbol = (polygonGraphic.symbol as SimpleFillSymbol).clone();
          polygonGraphic.symbol.color = color;
        },
      })
      .add({
        targets: color,
        a: 0.6,
        duration: 300,
        easing: "easeInOutExpo",
        complete: () => {
          this.sceneLayer.definitionExpression = "OBJECTID NOT IN (" + MASKED_OBJIDS.join(",") + ")";
        },
      })
      .add({
        targets: color,
        a: 0.6,
        duration: 300,
        easing: "easeInOutExpo",
      })
      .add({
        targets: color,
        a: 0,
        duration: 300,
        easing: "easeInOutExpo",
        complete: () => {
          this.graphicsLayer.removeMany(this.graphicsLayer.graphics.filter(
            (graphic) => graphic !== polygonGraphic).toArray(),
          );
        },
      })
      .finished;
  }

  private _goToSlide(slide: Slide): IPromise {
    return slide.applyTo(this.view).then(() => {

      this.graphicsLayer.visible = true;
      // Wait for all layers to update after applying a new slide
      return eachAlways(this.view.layerViews.map((layerView) => {
        return whenNotOnce(layerView, "updating");
      }));
    });
  }

  private _attachSlides(sceneSlidesDiv: HTMLDivElement) {
    this.view.when(() => {

      // Loop through each slide in the collection
      this.map.presentation.slides.forEach((slide, index) => {

        // Create a new <div> element for each slide and place the title of
        // the slide in the element.
        const slideElement = document.createElement("div");
        slideElement.id = slide.id;
        slideElement.classList.add("slide");

        // Create a <div> element to display the slide title text.
        const title = document.createElement("div");
        title.innerText = slide.title.text || "";
        slideElement.appendChild(title);

        // Create a new <img> element and place it inside the newly created <div>.
        // This will reference the thumbnail from the slide.
        const img = new Image();
        img.src = slide.thumbnail.url || "";
        img.title = slide.title.text || "";
        slideElement.appendChild(img);

        sceneSlidesDiv.appendChild(slideElement);

        slideElement.addEventListener("click", () => {
          this._goToSlide(slide)
          .then(() => {
            if (index === 1) {
              // Animate mask
              this._animateArea()
              .then(() => this._animateMask() )
              .then(() => this._goToSlide(this.map.presentation.slides.getItemAt(2)));

            }
          })
          .catch((error) => console.error(error));
        });
      });
    });
  }

}

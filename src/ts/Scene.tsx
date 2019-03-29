
// esri
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import { eachAlways } from "esri/core/promiseUtils";
import { whenNotOnce } from "esri/core/watchUtils";
import geometryEngine from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import IntegratedMeshLayer from "esri/layers/IntegratedMeshLayer";
import SceneLayer from "esri/layers/SceneLayer";
import UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import SceneLayerView from "esri/views/layers/SceneLayerView";
import FeatureFilter from "esri/views/layers/support/FeatureFilter";
import SceneView from "esri/views/SceneView";
import WebScene from "esri/WebScene";
import { tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

import { computeBoundingPolygon } from "./support/geometry";
import Operation from "./widget/operation/Operation";

// Constants

// One of low, medium, high
export const QUALITY = "medium";

export const MASKED_OBJIDS = [
  158321, 106893, 158711, 158613, 158632, 159047, 158099, 158249, 147102, 106899, 107439, 158654, 158247, 158307,
  158610, 158963, 154542, 158869, 158814, 158900, 107340, 107395, 107172, 158336, 158784, 158571, 158600, 158348,
  158955, 158205, 158883, 158431, 158326, 158353, 158449, 158587, 158251, 158857, 159069, 158706,
];

export const MASK_AREA = [
  [-8235924.058660398, 4968738.274357371],
  [-8235409.000644938, 4968717.325404106],
  [-8235333.439527529, 4968898.289607817],
  [-8235295.877979361, 4969109.891441089],
  [-8236134.357229519, 4969027.878528339],
  [-8236138.632189713, 4968850.261903069],
  [-8235919.081131686, 4968836.806196137],
];

@subclass("app.widgets.webmapview")
export default class Scene extends declared(Widget) {

  @property()
  public readonly map: WebScene = new WebScene({
    portalItem: {
      id: "8dd394c07205432bad112c21cbbc307f",
    },
  });

  @property({
    readOnly: true,
  })
  public readonly view = new SceneView({
    map: this.map,
    ui: {
      components: [],
    },
    qualityProfile: QUALITY,
  } as any);

  @property({
    readOnly: true,
  })
  public readonly sketchLayer: GraphicsLayer = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" }});

  public readonly maskPolygon = new Polygon({
    rings: [MASK_AREA],
    spatialReference: SpatialReference.WebMercator,
  });

  public readonly boundingPolygon = computeBoundingPolygon(this.maskPolygon);

  private sceneLayer: SceneLayer;

  private sceneLayerView: SceneLayerView;

  private sceneLayerFilter = new FeatureFilter({
    spatialRelationship: "disjoint",
    geometry: this.maskPolygon,
  });

  private sceneLayerRenderer = new UniqueValueRenderer({
    // field: "OBJECTID",
    valueExpression: "When(indexof([" + MASKED_OBJIDS.join(",")
    + "], $feature.OBJECTID) < 0, 'show', 'hide')",
    defaultSymbol: {
      type: "mesh-3d",
      symbolLayers: [{
        type: "fill",
        material: {
          color: "white",
        },
        edges: {
          type: "solid",
          color: [150, 150, 150],
          size: .5,
        },
      }],
    },
  } as any);

  private boundingPolygonGraphic = new Graphic({
    geometry: this.boundingPolygon,
  });

  private texturedBuildings = new IntegratedMeshLayer({
    portalItem: {
      id: "0406ec9f82824f368d8710ec42b8e5f6",
    },
    visible: false,
  });

  public postInitialize() {

    // Create global view reference
    (window as any).view = this.view;

    this.map.when(() => {
      this.map.add(this.sketchLayer);
      this.map.add(this.texturedBuildings);
      this.sketchLayer.add(this.boundingPolygonGraphic);
      this.sceneLayer = this.map.layers.find((layer) => layer.type === "scene") as SceneLayer;
      this.sceneLayer.renderer = this.sceneLayerRenderer;
      this.sceneLayer.popupEnabled = false;
      this.view.whenLayerView(this.sceneLayer).then((lv: SceneLayerView) => {
        this.sceneLayerView = lv;
      });
    });
  }

  public render() {
    return (
      <div>
        <div id="sceneView" bind={ this } afterCreate={ this._attachSceneView } />
      </div>
    );
  }

  public clear() {
    this.drawLayers().forEach((layer) => layer.removeAll());
  }

  public showMaskedBuildings(color?: any) {

    const uniqueValueInfos = [];
    if (color && color.a !== 0) {

      // Show masked buildings with provided color, all other buildings are white
      uniqueValueInfos.push({
        value: "hide",
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{
            type: "fill",
            material: {
              color,
              colorMixMode: "replace",
            },
            edges: {
              type: "solid",
              color: [150, 150, 150, color.a],
              size: .5,
            },
          }],
        },
      } as any);
      this.boundingPolygonGraphic.symbol = {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          outline: {
            width: 0,
          },
        } as any;
      this.sceneLayerView.set("filter", null);
      this.drawLayers().forEach((layer) => layer.visible = false);
    } else {

      // Do not show masked buildings and dimm surounding ones
      uniqueValueInfos.push({
        value: "showwww",
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{
            type: "fill",
            material: {
              color: [180, 180, 180],
              colorMixMode: "replace",
            },
            edges: {
              type: "solid",
              color: [100, 100, 100],
              size: .5,
            },
          }],
        },
      } as any);
      this.sceneLayerView.filter = this.sceneLayerFilter;
      this.drawLayers().forEach((layer) => layer.visible = true);
      this.boundingPolygonGraphic.symbol = {
          type: "simple-fill",
          color: [0, 0, 0, 0.15],
          outline: {
            width: 0,
          },
        } as any;
    }
    this.sceneLayerRenderer.uniqueValueInfos = uniqueValueInfos;
    this.sceneLayer.renderer = this.sceneLayerRenderer.clone();
    this.texturedBuildings.visible = false;
    this.sceneLayer.visible = true;
  }

  public showTexturedBuildings() {
    this.texturedBuildings.visible = true;
    this.drawLayers().forEach((layer) => layer.visible = false);
    this.sceneLayer.visible = false;
    this.boundingPolygonGraphic.symbol = {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {
          width: 0,
        },
      } as any;
  }

  public adjustSymbolHeights() {
    this.drawLayers().forEach((layer) => {
      if (layer.get("elevationInfo.mode") === "relative-to-ground") {
        layer.graphics.toArray().forEach((graphic) => {
          this.adjustHeight(graphic);
        });
      }
    });
  }

  public adjustHeight(graphic: Graphic) {
    const point = graphic.geometry as Point;
    if (point.type === "point" && point.hasZ) {
      const height = this.heightAtPoint(point);
      if (height !== point.z) {
        const newPoint = point.clone();
        newPoint.z = height;
        graphic.geometry = newPoint;
      }
    }
  }

  public heightAtPoint(mapPoint: Point): number {
    return this.drawLayers().reduceRight((max1, layer) => {
      return layer.graphics.reduceRight((max2, graphic) => {
        const layers = graphic.get<any>("symbol.symbolLayers");
        const extrusion = layers && layers.getItemAt(0).size;
        if (max2 < extrusion && geometryEngine.contains(graphic.geometry, mapPoint)) {
          return extrusion;
        }
        return max2;
      }, max1);
    }, 0);
  }

  public whenNotUpdating(): IPromise {
    // Wait for map to load
    return this.map.when().then(() => {
      // For each loaded layer, wait for its layer view
      const lvPromises = this.map.allLayers.map((layer) => {
        // For each layer view, wait for it to be done updating
        return this.view.whenLayerView(layer).then((lv) => {
          return whenNotOnce(lv, "updating");
        });
      });
      return eachAlways(lvPromises);
    });
  }

  public drawLayers(): Collection<GraphicsLayer> {
    return this.map.layers.filter((layer) => {
      if (layer instanceof GraphicsLayer) {
        return layer !== this.sketchLayer;
      }
      return false;
    }) as any;
  }

  private _attachSceneView(sceneViewDiv: HTMLDivElement) {
    this.view.container = sceneViewDiv;
  }

}

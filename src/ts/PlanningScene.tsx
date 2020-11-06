/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { property, subclass } from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import { whenNotOnce } from "esri/core/watchUtils";
import geometryEngine from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import SpatialReference from "esri/geometry/SpatialReference";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneLayer from "esri/layers/SceneLayer";
import { SimpleRenderer } from "esri/renderers";
import SceneLayerView from "esri/views/layers/SceneLayerView";
import FeatureFilter from "esri/views/layers/support/FeatureFilter";
import SceneView from "esri/views/SceneView";
import WebScene from "esri/WebScene";
import { tsx } from "esri/widgets/support/widget";

import App from "./App";
import { computeBoundingPolygon } from "./support/geometry";
import WidgetBase from "./widget/WidgetBase";

// One of low, medium, high
export const QUALITY = "medium";

@subclass("app.widgets.webmapview")
export default class PlanningScene extends WidgetBase {

  @property()
  public map: WebScene;

  @property()
  public view: SceneView;

  @property()
  public sketchLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "on-the-ground",
    },
  });

  public maskPolygon: Polygon;

  private sceneLayer: SceneLayer;

  private sceneLayerView: SceneLayerView;

  private sceneLayerFilter: FeatureFilter;

  private sceneLayerRenderer = new SimpleRenderer({
    symbol: {
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

  private boundingPolygonGraphic: Graphic;

  public constructor(app: App) {
    super({ app });

    this.map = new WebScene({
      portalItem: {
        id: app.settings.webSceneId,
      },
    });

    this.view = new SceneView({
      map: this.map,
      qualityProfile: QUALITY,
    } as any);
  }

  public postInitialize() {

    // Create global view reference
    (window as any).view = this.view;

    this.maskPolygon = new Polygon({
      rings: [this.app.settings.planningArea],
      spatialReference: SpatialReference.WebMercator,
    });

    this.sceneLayerFilter = new FeatureFilter({
      spatialRelationship: "disjoint",
      geometry: this.maskPolygon,
    });

    this.boundingPolygonGraphic = new Graphic({
      geometry: computeBoundingPolygon(this.maskPolygon),
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0.15],
        outline: {
          width: 0,
        },
      } as any,
    });

    this.map.when(() => {
      this.map.add(this.sketchLayer);
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
        <div id="sceneView" bind={ this } afterCreate={ this.attachSceneView } />
      </div>
    );
  }

  public clear() {
    this.drawLayers().forEach((layer) => layer.removeAll());
  }

  public showMaskedBuildings(color?: any) {
    if (color && color.a !== 0) {
      // Show masked buildings with provided color, all other buildings are white
      this.boundingPolygonGraphic.visible = false;
      this.sceneLayerView.set("filter", null);
      this.drawLayers().forEach((layer) => layer.visible = false);
    } else {
      this.sceneLayerView.filter = this.sceneLayerFilter;
      this.drawLayers().forEach((layer) => layer.visible = true);
      this.boundingPolygonGraphic.visible = true;
    }
    this.sceneLayer.visible = true;
  }

  public showTexturedBuildings() {
    this.drawLayers().forEach((layer) => layer.visible = false);
    this.sceneLayer.visible = true;
    this.sceneLayerView.set("filter", null);
    this.boundingPolygonGraphic.symbol = {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {
          width: 0,
        },
      } as any;
  }

  public whenNotUpdating(): Promise<void> {
    return whenNotOnce(this.view, "updating");
  }

  public drawLayers(): Collection<GraphicsLayer> {
    return this.map.layers.filter((layer) => {
      if (layer instanceof GraphicsLayer) {
        return layer !== this.sketchLayer;
      }
      return false;
    }) as any;
  }

  private attachSceneView(sceneViewDiv: HTMLDivElement) {
    this.view.container = sceneViewDiv;
  }

  private getExtrudedHeight(point: Point, graphic: Graphic) {
    if (graphic.symbol.type === "polygon-3d" && geometryEngine.contains(graphic.geometry, point)) {
      const layers = graphic.get<any>("symbol.symbolLayers");
      const extrusion = layers && layers.getItemAt(0).size;
      return extrusion;
    }
    return 0;
  }

}

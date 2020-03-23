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
import Geometry from "esri/geometry/Geometry";
import geometryEngine from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";

import PlanningScene from "../../PlanningScene";
import DrawWidget from "../DrawWidget";
import WidgetOperation, { OperationHandle } from "./WidgetOperation";

export default class DrawGeometry<G extends Geometry> extends WidgetOperation {

  protected scene: PlanningScene;

  constructor(widget: DrawWidget, public readonly graphic: Graphic, protected geometryType: string) {
    super(widget);
    this.scene = widget.app.scene;
  }

  public create(): Promise<G> {
    return this.runSketchViewModel(true);
  }

  public update(): Promise<G> {
    return this.runSketchViewModel(false);
  }

  protected runSketchViewModel(create: boolean): Promise<G> {
    const haloOpacity = this.scene.view.highlightOptions.haloOpacity;
    const fillOpacity = this.scene.view.highlightOptions.fillOpacity;

    const sketchViewModel = this.createSketchViewModel();

    const keyEventListener = this.scene.view.on("key-down", (event) => {
      const remove = (event.key === "Delete" || event.key === "Backspace");
      if (remove || event.key === "Escape") {
        if (remove || create) {
          this.widget.layer.remove(this.graphic);
        }
        this.cancel();
      }
    });

    const promise = this.initiate<G>((handle) => {

      if (create) {
        this.scene.view.highlightOptions.haloOpacity = 0;
      }
      this.scene.view.highlightOptions.fillOpacity = 0;

      sketchViewModel.on(["create", "update"] as any, (event) => {
        this.onSketchViewModelEvent(sketchViewModel, event as any, handle);
      });

      this.launchSketchViewModel(sketchViewModel, create);
      this.scene.view.focus();
    }, () => {
      sketchViewModel.cancel();
    });

    // Clean up
    promise.finally(() => {
      // Cleanup resources
      keyEventListener.remove();
      sketchViewModel.cancel();
      sketchViewModel.destroy();

      // Reset scene
      this.scene.view.highlightOptions.haloOpacity = haloOpacity;
      this.scene.view.highlightOptions.fillOpacity = fillOpacity;
      this.scene.adjustSymbolHeights();
    });

    return promise;
  }

  protected launchSketchViewModel(sketchViewModel: SketchViewModel, create: boolean) {
    const sketchGraphic = this.createSketch(sketchViewModel);
    if (create) {
      sketchViewModel.create(this.geometryType);
    } else {

      // Remove z value for point graphics as currently the SketchViewModel won't allow that
      const hasZ = sketchGraphic.geometry.hasZ;
      const lastGeometry = sketchGraphic.geometry.clone();
      if (hasZ) {
        sketchGraphic.geometry.hasZ = false;
      }

      if (sketchGraphic.geometry.type === "point") {
        sketchViewModel.update(sketchGraphic);
      } else {
        sketchViewModel.update(sketchGraphic, { tool: "reshape" });
      }

      if (hasZ) {
        sketchGraphic.geometry = lastGeometry;
      }
    }
  }

  protected onSketchViewModelEvent(sketchViewModel: SketchViewModel,
                                   event: __esri.SketchViewModelCreateEvent | __esri.SketchViewModelUpdateEvent,
                                   handle: OperationHandle<G>) {
    const sketch = this.graphicFromEvent(event);
    // If we are done, remove extra sketch graphic
    if (event.state === "cancel" || event.state === "complete") {
      if (sketch && sketch !== this.graphic) {
        sketchViewModel.layer.remove(sketch);
      }
    }

    if (event.state === "cancel" || sketch === null) {
      if (event.type === "create") {
        this.widget.layer.remove(this.graphic);
      }
      handle.reject();
    } else {
      const geometry = this.geometryFromSketch(sketch);
      this.updateGraphicFromGeometry(geometry);

      if (event.state === "complete") {
        if (geometry) {
          handle.resolve(geometry);
        } else {
          this.widget.layer.remove(this.graphic);
          handle.reject();
        }
      }
    }
  }

  protected createSketchViewModel(): SketchViewModel {
    return new SketchViewModel({
      view: this.scene.view,
      layer: this.widget.layer,
      updateOnGraphicClick: false,
    });
  }

  protected createSketch(_: SketchViewModel): Graphic {
    return this.graphic;
  }

  protected geometryFromSketch(sketchGraphic: Graphic): G | null {
    return sketchGraphic.geometry.clone() as G;
  }

  protected updateGraphicFromGeometry(geometry: G | null) {
    if (geometry) {
      this.graphic.geometry = geometry;
      this.graphic.visible = true;

      if (!this.graphic.layer) {
        this.widget.layer.add(this.graphic);
      }
    } else {
      this.graphic.visible = false;
    }
  }

  protected clippedGeometry<T extends Geometry>(geometry: T): T | null {
    const maskPolygon = this.scene.maskPolygon;
    const result = geometryEngine.intersect(maskPolygon, geometry);
    return result as T;
  }

  protected snapPoint(point: Point): Point {
    const maskPolygon = this.scene.maskPolygon;
    return geometryEngine.nearestCoordinate(maskPolygon, point).coordinate;
  }

  protected snapVertices(vertices: number[][]) {
    const spatialReference = this.scene.view.spatialReference;
    vertices.forEach((point) => {
      const snappedPoint = this.snapPoint(new Point({
        x: point[0],
        y: point[1],
        spatialReference,
      }));
      point[0] = snappedPoint.x;
      point[1] = snappedPoint.y;
    });
  }

  private graphicFromEvent(event: any): Graphic | null {
    if (event.graphics && event.graphics.length) {
      return event.graphics[0];
    }
    return event.graphic;
  }

}

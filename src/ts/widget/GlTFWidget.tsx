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
import { aliasOf, property, subclass } from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import ObjectSymbol3DLayer from "esri/symbols/ObjectSymbol3DLayer";
import PointSymbol3D from "esri/symbols/PointSymbol3D";
import { renderable, tsx } from "esri/widgets/support/widget";

import DrawWidget from "./DrawWidget";
import GlTFImport from "./support/GlTFImport";


enum GlTFWidgetState {
  Import = "Import",
  Loading = "Loading",
  Place = "Place",
  Idle = "Idle",
}

@subclass("app.draw.GlTFWidget")
export default class GlTFWidget extends DrawWidget {

  @property()
  @renderable()
  public state: GlTFWidgetState = GlTFWidgetState.Idle;

  @property()
  public currentImport: GlTFImport;

  @property()
  @aliasOf("currentImport.progress")
  @renderable()
  public progress: number;

  public postInitialize() {
    this.watch("progress", (value) => this.toggleLoadingIndicator(true, "Importing " + value + "%"));
  }

  public render() {
    const classList = Object.keys(GlTFWidgetState).reduce((map, key) => {
      if (this.state === key) {
        map[key] = ["sketchfab-widget"];
      } else {
        map[key] = ["sketchfab-widget", "hide"];
      }
      return map;
    }, {});

    return (
      <div>
        <div class={ classList[GlTFWidgetState.Import].join(" ") }
          afterCreate={ this.attachImportWidget.bind(this) }>
            <div id="glTFLogo" class="gltf-logo"></div>
          </div>
      </div>
    );
  }

  public startImport() {
    this.state = GlTFWidgetState.Import;
    window.onblur = () => this.removeGlTFLogo();
  }

  private removeGlTFLogo() {
    const logo = document.getElementById("glTFLogo");
    if (logo) {
      logo.classList.add("hide");
    }
  }

  private importGlTF(url: string) {
    this.toggleLoadingIndicator(true);
    this.state = GlTFWidgetState.Loading;
    this.currentImport = new GlTFImport(url);
    this.currentImport.blobUrl.then((blobUrl) => {

      this.toggleLoadingIndicator(false);

      // Place imported glTF in center of view
      const point = this.app.scene.view.center.clone();

      const graphic = new Graphic({
        geometry: point,
        symbol: new PointSymbol3D({
          symbolLayers: [
            new ObjectSymbol3DLayer({
              resource: {
                href: blobUrl,
              },
              anchor: "relative",
              anchorPosition: { x: 0, y: 0, z: -0.5 },
              // height: 50,
            }),
          ],
        }),
      });

      // this.layer.removeAll();
      this.layer.add(graphic);
      this.updateGraphic(graphic);

      this.state = GlTFWidgetState.Idle;

    }).catch((error) => {
      console.error("Something just went wrong", error);
    });
  }

  private attachImportWidget(element: HTMLDivElement): any {
    return new (window as any).SketchfabImporter(
        element, {
        onModelSelected: (result: any) => {
          this.importGlTF(result.download.gltf.url);
        },
    });
  }

}

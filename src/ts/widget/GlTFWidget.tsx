import { aliasOf, declared, property, subclass } from "esri/core/accessorSupport/decorators";
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
export default class GlTFWidget extends declared(DrawWidget) {

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
    this.layer.elevationInfo = {
      mode: "relative-to-ground",
    };
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
          afterCreate={ this._attachImportWidget.bind(this) }>
            <div id="glTFLogo" class="gltf-logo"></div>
          </div>
      </div>
    );
  }

  public startImport() {
    this.state = GlTFWidgetState.Import;
    window.onblur = () => this._removeGlTFLogo();
  }

  private _removeGlTFLogo() {
    const logo = document.getElementById("glTFLogo");
    if (logo) {
      logo.classList.add("hide");
    }
  }

  private _importGlTF(url: string) {
    this.toggleLoadingIndicator(true);
    this.state = GlTFWidgetState.Loading;
    this.currentImport = new GlTFImport(url);
    this.currentImport.blobUrl.then((blobUrl) => {

      this.toggleLoadingIndicator(false);

      const point = this.app.scene.maskPolygon.centroid;
      point.hasZ = true;
      point.z = this.app.scene.heightAtPoint(point);

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

      console.log("Adding glTF to layer", blobUrl);

      // this.layer.removeAll();
      this.layer.add(graphic);
      this.updateGraphic(graphic);

      this.state = GlTFWidgetState.Idle;

    }).catch((error) => {
      console.error("Something just went wrong", error);
    });
  }

  private _attachImportWidget(element: HTMLDivElement) {
    const importer = new (window as any).SketchfabImporter(
        element, {
        onModelSelected: (result: any) => {
          console.log("Selected Sketchfab model", result);
          this._importGlTF(result.download.gltf.url);
        },
    });
    console.log("Initialized importer", importer);
  }

}

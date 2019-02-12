
import DrawWidget from "./DrawWidget";
import GlTFImporter from "./support/GlTFImporter";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { tsx } from "esri/widgets/support/widget";
import PointSymbol3D = require('esri/symbols/PointSymbol3D');
import ObjectSymbol3DLayer = require('esri/symbols/ObjectSymbol3DLayer');
import Point = require('esri/geometry/Point');

@subclass("app.draw.GlTFWidget")
export default class GlTFWidget extends declared(DrawWidget) {

  @property()
  public layer = this.createGraphicsLayer();

  public importer: GlTFImporter;

  private sketchfabImporter: any;

  public render() {
    return (
      <div style="height: 70%; padding: 150px; pointer-events: auto;">
        <div style="height: 100%;" afterCreate={ this._attachImportWidget.bind(this) }></div>
      </div>
    );
  }

  public importGlTF() {

    this.importer.import().then((blobUrl) => {
      console.log("Done downloading", blobUrl);

      const point = new Point({
        x: -8235607.175360308,
        y: 4968884.173592559,
        spatialReference: this.scene.view.spatialReference,
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: new PointSymbol3D({
          symbolLayers: [
            new ObjectSymbol3DLayer({
              resource: {
                href: blobUrl,
              },
              anchor: "relative",
              anchorPosition: { x: 0, y: 0, z: -1 },
              height: 50,
            }),
          ],
        }),
      });

      console.log("Adding glTF to layer", blobUrl);

      this.layer.removeAll();
      this.layer.add(graphic);

    }).catch((error) => {
      console.error("Something just went wrong", error);
    });

    this.importer.watch("progress", () => console.log("Progress: " + this.importer.progress + "%"));
  }

  private _importGlTF(url: string) {
    this.importer = new GlTFImporter(url);
    this.importGlTF();
  }

  private _attachImportWidget(element: HTMLDivElement) {
    this.sketchfabImporter = new (window as any).SketchfabImporter(
        element, {
        onModelSelected: (result: any) => {
          this._importGlTF(result.download.gltf.url);
        },
    });
  }

}


import Color from "esri/Color";
import Accessor from "esri/core/Accessor";
import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import { create as createPromise } from "esri/core/promiseUtils";
import Geometry from "esri/geometry/Geometry";
import { contains, intersect, nearestCoordinate } from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Polyline from "esri/geometry/Polyline";
import Graphic from "esri/Graphic";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import Draw from "esri/views/draw/Draw";

import Scene from "../../Scene";
import { redraw } from "../../support/graphics";
import "../support/extensions";

interface DrawEvent {
  vertices: number[][];
  preventDefault: () => void;
}

const DEFAULT_COLOR = new Color("grey");

export interface CreatePolygonParams {
  color?: Color;
  scene: Scene;
}

@subclass("app.draw.operation.CreatePolygon")
export default class CreatePolygon extends declared(Accessor) {

  public static activeOperation: CreatePolygon | null;

  @property()
  public scene: Scene;

  @property()
  public polygonSymbol: SimpleFillSymbol;

  @property()
  public polylineSymbol: SimpleLineSymbol;

  @property()
  public result: IPromise<Polygon[]>;

  protected polylineGraphic: Graphic;

  protected polygonGraphic: Graphic;

  protected draw: Draw | null;

  protected resolve: (value: Polygon[]) => void;

  protected reject: (error?: any) => void;

  constructor(params: CreatePolygonParams) {
    super(params);

    const color = params.color || DEFAULT_COLOR;
    this.polygonSymbol = this.createPolygonSymbol(color);

    this.polylineSymbol = new SimpleLineSymbol({
      color,
      width: 4,
    });

    this.result = createPromise(((resolve: (_: Polygon[]) => void, reject: (error?: any) => void) => {
      this.resolve = resolve;
      this.reject = reject;
    }) as any);

    this.result.always(() => {
      this.scene.view.container.style.cursor = "";
    });
  }

  public start() {
    if (this.draw) {
      console.error("start() called multiple times");
      return;
    }

    this.polylineGraphic = new Graphic({ symbol: this.polylineSymbol });
    this.polygonGraphic = new Graphic({ symbol: this.polygonSymbol });
    this.scene.sketchLayer.addMany([this.polygonGraphic, this.polylineGraphic]);

    this.draw = new Draw({ view: this.scene.view });
    const action = this.draw.create("polygon", { mode: "click" });
    action.on([
        "vertex-add",
        "vertex-remove",
        "cursor-update",
        "redo",
        "undo",
      ] as any,
      (event) => { this._drawNewPolygon(event); },
    );
    action.on(
      "draw-complete",
      (event) => { this._completeNewPolygon(event); });

    this.scene.view.focus();
  }

  public cancel() {
    if (this.draw) {
      this.draw.reset();
    }
  }

  protected createPolygonSymbol(color: Color): SimpleFillSymbol {
    return new SimpleFillSymbol({
     color: color.withAlpha(0.5),
     style: "diagonal-cross",
     outline: {  // autocasts as new SimpleLineSymbol()
       color: color.withAlpha(0.3),
       width: "0.5px",
     },
   });
  }

  private _drawNewPolygon(event: DrawEvent) {
    this.scene.view.container.style.cursor = "crosshair";
    // create a new graphic presenting the polyline that is being drawn on the view
    const vertices = this._snappedVertices(event);

    const polyline = this._createPolyline(vertices);

    if (polyline) {

      this.polylineGraphic = redraw(this.polylineGraphic, "geometry", polyline);

      const polygon = this._createPolygon(vertices);
      if (polygon) {
        if (polygon.isSelfIntersecting) {
          this.polygonGraphic.symbol = this.createPolygonSymbol(new Color("red"));
          event.preventDefault();
        } else {
          this.polygonGraphic.symbol = this.polygonSymbol;
        }

        this.polygonGraphic = redraw(this.polygonGraphic, "geometry", polygon);
      }
    }
  }

  private _completeNewPolygon(event: DrawEvent) {

    this.scene.sketchLayer.removeMany([this.polygonGraphic, this.polylineGraphic]);

    const vertices = this._snappedVertices(event);
    const polygon = this._createPolygon(vertices);

    this.resolve(polygon ? this._clippedPolygons(polygon) : []);
  }

  private _snappedVertices(event: DrawEvent): number[][] {
    const spatialReference = this.scene.view.spatialReference;
    return event.vertices.map((point) => {
      const mapPoint = new Point({
        x: point[0],
        y: point[1],
        spatialReference,
      });
      if (!contains(this.scene.maskPolygon, mapPoint)) {
        const nearestPoint = nearestCoordinate(this.scene.maskPolygon, mapPoint);
        return [nearestPoint.coordinate.x, nearestPoint.coordinate.y];
      } else {
        return point;
      }
    });
  }

  private _createPolygon(vertices: number[][]): Polygon | null {
    return vertices.length < 3 ? null : new Polygon({
      rings: [vertices],
      spatialReference: this.scene.view.spatialReference,
    });
  }

  private _createPolyline(vertices: number[][]): Polyline | null {
    return vertices.length < 2 ? null : new Polyline({
      paths: [vertices],
      spatialReference: this.scene.view.spatialReference,
    });
  }

  private _distinctPolygon(geometry: Geometry): Polygon[] {
    if (geometry instanceof Polygon) {
      if (geometry.rings.length > 1) {
        return geometry.rings.map((ring) => new Polygon({
          rings: [ring],
          spatialReference: geometry.spatialReference,
        }));
      } else {
        return [geometry];
      }
    }
    return [];
   }

  private _clippedPolygons(polygon: Polygon): Polygon[] {
    const clips = intersect(this.scene.maskPolygon, polygon);
    if (clips instanceof Array) {
      return clips.map((clip) => this._distinctPolygon(clip)).reduce((result, val) => result.concat(val));
    } else {
      return this._distinctPolygon(clips);
    }
  }

}

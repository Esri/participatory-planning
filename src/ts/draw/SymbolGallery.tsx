
import Scene from "../Scene";

// esri
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection = require("esri/core/Collection");
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Portal from "esri/portal/Portal";
import PortalGroup from "esri/portal/PortalGroup";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";
import View from "esri/views/SceneView";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget from "esri/widgets/Widget";

// interactjs
import interact, { InteractEvent } from "interactjs";

import SymbolGroup from "./SymbolGallery/SymbolGroup";
import SymbolItem from "./SymbolGallery/SymbolItem";
import ScreenPoint = require('esri/geometry/ScreenPoint');
import Point = require('esri/geometry/Point');

// import interact from "interactjs";

const CSS = {
  base: "esri-basemap-gallery esri-widget esri-widget--panel-height-only",
  sourceLoading: "esri-basemap-gallery--source-loading",
};

const SymbolGroupCollection = Collection.ofType<SymbolGroup>(SymbolGroup);

@subclass("app.widgets.SymbolGallery")
export default class SymbolGallery extends declared(Widget) {

  @property() public scene: Scene;

  @renderable()
  @property() public groups = new SymbolGroupCollection();

  @renderable()
  @property()
  public selectedGroup: SymbolGroup | null;

  @property({
    type: Collection.ofType(SymbolItem),
    readOnly: true,
    dependsOn: ["selectedGroup"],
  })
  @aliasOf("selectedGroup.item")
  public items: Collection<SymbolItem>;

  @property({
    readOnly: true,
  })
  public readonly iconClass = "icon-ui-collection";

  private portal: Portal | null = null;

  private loadingPromise: IPromise;

  private dragGraphic: Graphic | null = null;
  private dragSymbol: WebStyleSymbol | null;

  constructor(params?: any) {
    super(params);
  }

  public render() {

    if (this.selectedGroup) {
      this.selectedGroup.loadItems().then(() => this.scheduleRender());
      return (
        <div>
          <div class="gallery-grid">
          {
            this.selectedGroup.items.toArray().map((item) => this._renderSymbolItem(item))
          }
          </div>
        </div>
      );
    } else if (this.groups.length) {
      return (
        <div>
          <nav class="leader-1">
          {
            this.groups.toArray().map((group) => (
              <button class="btn btn-grouped" onclick={ () => {
                this.selectedGroup = group;
              } }>{ group.title }</button>
            ))
          }
          </nav>
        </div>
      );
    } else {
      this._load();
      return (
        <div>
          <div class="loader is-active padding-leader-3 padding-trailer-3">
            <div class="loader-bars"></div>
            <div class="loader-text">Loading...</div>
          </div>
        </div>
      );
    }

    // const sourceLoading = false;
    // const rootClasses = {
    //   [CSS.sourceLoading]: sourceLoading,
    // };

    // let renderedItems;
    // if (this.items.length) {
    //   renderedItems = this.items.toArray().map(this._renderSymbolItem, this);
    //   // renderedItems = this._renderSymbolItem(this.items.toArray());
    // } else {
    //   renderedItems = "Loading...";
    // }

  }

  private _renderSymbolItem(item: SymbolItem) {
    // console.log("Rendering an item", item);
    const href = item.thumbnailHref;
    const key = item.group.category + item.name;
    return (
      <div class="gallery-grid-item" key={key} bind={this} afterCreate={this._addInteract} data-item={item}>
        <img src={href} />
      </div>
    );
    // draggable="true" bind={this} ondragstart={ this.startDrag }
  }

  private _addInteract(element: HTMLDivElement) {
    interact(element)
      .draggable({
        inertia: true,
        onmove: (event) => this._onDrag(event),
      })
      .on("dragstart", (event) => this._onDragStart(event))
      .on("dragend",  (event) => this._onDragEnd(event));
  }

  private _onDragStart(event: InteractEvent) {
    const item = event.target["data-item"] as SymbolItem;
    if (item != null) {
      this.dragSymbol = new WebStyleSymbol({
        name: item.name,
        styleName: item.group.category,
      });
      this.dragSymbol.fetchSymbol();

      this.dragGraphic = new Graphic({
        symbol: this.dragSymbol,
      });
      this.scene.drawLayer.add(this.dragGraphic);
    }
  }

  private _onDrag(event: InteractEvent) {
    const target = event.target;
       // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element
    // target.style.webkitTransform =
    // target.style.transform =
    //  'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    // target.setAttribute('data-x', x);
    // target.setAttribute('data-y', y);

    if (this.dragGraphic && this.dragSymbol) {
      this.scene.drawLayer.remove(this.dragGraphic);
      this.dragGraphic = this.dragGraphic.clone();
      this.dragGraphic.symbol = this.dragSymbol;

      const mapPoint = this._mapPointForEvent(event); // this.scene.view.toMap(screenPoint);
      this.dragGraphic.geometry = mapPoint;
      this.scene.drawLayer.add(this.dragGraphic);
    }
  }

  private _mapPointForEvent(event: {clientX: number, clientY: number}): Point {
    const a = new ScreenPoint({x: event.clientX, y: event.clientY});
    const b = new ScreenPoint({x: event.clientX, y: event.clientY - 50});
    const aMap = this.scene.view.toMap(a);
    const bMap = this.scene.view.toMap(b);

    const result = new Point({
      x: aMap.x + 2 * (bMap.x - aMap.x),
      y: aMap.y + 2 * (bMap.y - aMap.y),
      spatialReference: aMap.spatialReference,
    });

    return result;
  }

  private _onDragEnd(event: InteractEvent) {
    if (this.dragGraphic) {
      // this.scene.drawLayer.remove(this.dragGraphic);
      this.dragGraphic = null;
    }
  }

  private startDrag(event: DragEvent) {
    if (event.target && event.dataTransfer) {
      const item = event.target["data-item"];
      this.dragSymbol = new WebStyleSymbol({
        name: item.name,
        styleName: item.group.category,
      });
      this.dragSymbol.fetchSymbol();
      console.log("Received drag start event");
    }
  }

  private _load(): IPromise {
    if (!this.loadingPromise) {
      this.loadingPromise = this
        ._loadPortal()
        .then((portal) => this._querySymbolGroups(portal))
        .then((items) => items.map((item) => new SymbolGroup(item)))
        .then((symbolGroups) => {
          this.groups.removeAll();
          this.groups.addMany(symbolGroups);
          console.log("Groups loaded", this.groups);
        });
    }

    return this.loadingPromise;
  }

  private _loadPortal(): IPromise<Portal> {
    const portal = this.portal || Portal.getDefault();

    return portal.load().then(() => {
      this.portal = portal;
      return portal;
    });
  }

  private _querySymbolGroups(portal: Portal): IPromise<PortalItem[]> {
    console.log("Querying the portal", portal.symbolSetsGroupQuery);
    return portal.queryGroups({
      query: "title:\"Esri Styles\" AND owner:esri_en",
    })
    .then((groups: PortalQueryResult): IPromise<PortalItem[]> => {
      return groups.results[0].queryItems(
        new PortalQueryParams({
          num: 20,
          sortField: "title",
        }),
      ).then((items: PortalQueryResult): PortalItem[] => items.results);
    });
  }

}


import Scene from "../Scene";

// esri
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import PortalItem from "esri/portal/PortalItem";
import { renderable, tsx } from "esri/widgets/support/widget";

import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";
import View from "esri/views/SceneView";
import Widget from "esri/widgets/Widget";

import Portal from "esri/portal/Portal";
import PortalGroup from "esri/portal/PortalGroup";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";

import Collection = require("esri/core/Collection");

import SymbolGroup from "./SymbolGallery/SymbolGroup";
import SymbolItem from "./SymbolGallery/SymbolItem";

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

  @property({
    type: WebStyleSymbol,
  })
  public dragSymbol: WebStyleSymbol | null;

  private portal: Portal | null = null;

  private loadingPromise: IPromise;

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
    return (
      <div class="gallery-grid-item" key={item.group.category + item.name} bind={this} afterCreate={this.addInteract}>
        <img src={href} data-item={item} draggable="true" bind={this} ondragstart={ this.startDrag } />
      </div>
    );
    // draggable="true" bind={this} ondragstart={ this.startDrag }
  }

  private addInteract(element: HTMLDivElement) {
    // interact(element)
    //   .draggable({
    //     inertia: true,
    //     onmove: (event) => {
    //       console.log("Moving", event);
    //     },
    //   });
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


import Scene from "../Scene";
import DrawWidget from "./DrawWidget";

// esri
import {
  aliasOf,
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import { nearestCoordinate } from "esri/geometry/geometryEngine";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import EsriSymbol from "esri/symbols/Symbol";
import WebStyleSymbol from "esri/symbols/WebStyleSymbol";
import { renderable, tsx } from "esri/widgets/support/widget";

import Operation from "./operation/Operation";
import UpdateOperation from "./operation/UpdateOperation";
import SymbolGroup from "./SymbolGallery/SymbolGroup";
import SymbolItem from "./SymbolGallery/SymbolItem";

const SymbolGroupCollection = Collection.ofType<SymbolGroup>(SymbolGroup);

@subclass("app.draw.SymbolGallery")
export default class SymbolGallery extends declared(DrawWidget) {

  @property() public scene: Scene;

  @renderable()
  @property() public groups = new SymbolGroupCollection();

  @renderable()
  @property()
  public selectedGroup: SymbolGroup | null;

  @renderable()
  @property()
  public selectedSymbol: SymbolItem | null;

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

  public postInitialize() {
    this.layer.elevationInfo = {
      mode: "relative-to-ground",
    };
    this._load();
  }

  public reset() {
    this.selectedGroup = null;
    this.selectedSymbol = null;
  }

  public render() {
    const galleryItems = this.selectedGroup ? this.selectedGroup.items.toArray() : [];
    const showGroups = !galleryItems.length && this.groups.length;
    const showLoading = !(galleryItems.length || showGroups);
    return (
      <div>
        <div class="gallery-grid" style={ (galleryItems.length && !this.selectedSymbol) ? "" : "display:none;"}>
        {
          galleryItems.map((item) => this._renderSymbolItem(item))
        }
        </div>
        <div class="menu" style={ showGroups ? "" : "display:none;"}>
          {
            this.groups.toArray().map((group, index) => (
              <div class="menu-item" key={ index }>
                <button class="btn btn-grouped" onclick={
                  () => this._selectGroup(group)
                } >{ group.title }</button>
              </div>
            ))
          }
        </div>
        <div style={ showLoading ? "" : "display:none;"}>
          <div class="loader is-active padding-leader-3 padding-trailer-3">
            <div class="loader-bars"></div>
            <div class="loader-text">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  private _renderSymbolItem(item: SymbolItem) {
    const href = item.thumbnailHref;
    const key = item.group.category + item.name;

    return (
      <div class="gallery-grid-item" key={key} bind={this} onclick={ this._selectSymbolItem } data-item={item}>
        <img src={href} />
      </div>
    );
    // draggable="true" bind={this} ondragstart={ this.startDrag }
  }

  private _selectGroup(group: SymbolGroup) {
    this.selectedGroup = group;
    this.selectedGroup.loadItems().then(() => {
      this.scheduleRender();
    });
  }

  private _selectSymbolItem(event: any) {
    this.selectedSymbol = event.currentTarget["data-item"];
    if (this.selectedSymbol) {
      this.selectedSymbol.fetchSymbol().then((symbol) => {
        this._placeSymbol(symbol);
      });
    }
  }

  private _placeSymbol(symbol: EsriSymbol) {
    this.createPoint(symbol).then((graphic) => {
      // Continue placing the same symbol
      this._placeSymbol(graphic.symbol);
    });
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

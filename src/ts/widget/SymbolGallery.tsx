
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
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import EsriSymbol from "esri/symbols/Symbol";
import { renderable, tsx } from "esri/widgets/support/widget";

import SymbolGroup from "./SymbolGallery/SymbolGroup";
import SymbolItem from "./SymbolGallery/SymbolItem";

export enum SymbolGroupId {
  Icons = "EsriIconsStyle",
  Trees = "EsriRealisticTreesStyle",
  Vehicles = "EsriRealisticTransportationStyle",
}

@subclass("app.draw.SymbolGallery")
export default class SymbolGallery extends declared(DrawWidget) {

  @property() public scene: Scene;

  @property() public groups = new Collection<SymbolGroup>();

  @renderable()
  @property()
  public selectedGroupId: SymbolGroupId | null;

  @property({
    readOnly: true,
    dependsOn: ["selectedGroupId", "groups"],
  })
  public get selectedGroup(): SymbolGroup | null {
    const selectedGroupId = this.selectedGroupId;
    return this.groups.find((group) => group.category === selectedGroupId);
  }

  @renderable()
  @property()
  public selectedSymbol: SymbolItem | null;

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

  public render() {
    const selectedGroup = this.selectedGroup;
    const galleryItems = selectedGroup ? selectedGroup.items.toArray() : [];
    const galleryGridClass = galleryItems.length ? ["gallery-grid"] : ["hide"];
    return (
      <div>
        <div class={ galleryGridClass.join(" ") }>
        {
          galleryItems.map((item) => this._renderSymbolItem(item))
        }
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

  private _selectSymbolItem(event: any) {
    const selectedSymbol = event.currentTarget["data-item"] as SymbolItem;
    if (selectedSymbol) {
      this.selectedGroupId = null;
      selectedSymbol.fetchSymbol().then((symbol) => {
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
        .then((symbolGroups) => {
          this.groups = new Collection<SymbolGroup>(symbolGroups);
          this.groups.forEach((group) => group.loadItems());
        });
        // .then(() => this.scheduleRender());
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

  private _querySymbolGroups(portal: Portal): IPromise<SymbolGroup[]> {
    return portal.queryGroups({
      query: "title:\"Esri Styles\" AND owner:esri_en",
    })
    .then((groups: PortalQueryResult) => {
      const queryParams = new PortalQueryParams({
        num: 20,
        sortField: "title",
      });
      return groups.results[0].queryItems(queryParams) as IPromise<PortalQueryResult>;
    })
    .then((queryResult) => {
      return queryResult.results;
    })
    .then((items) => {
      return items
        .map((item) => this._groupFromItem(item))
        .filter((item) => item != null) as SymbolGroup[];
    });
  }

  private _groupFromItem(item: PortalItem): SymbolGroup | null {
    const groupId = this._groupIdFromItem(item);
    return groupId ? new SymbolGroup(groupId, item) : null;
  }

  private _groupIdFromItem(item: PortalItem): SymbolGroupId | undefined {
  // Find type keyword that looks like it's an esri style and hope it works
    for (const typeKeyword of item.typeKeywords) {
      if (/^Esri.*Style$/.test(typeKeyword) && typeKeyword !== "Esri Style") {
        return Object.keys(SymbolGroupId)
          .map((key) => SymbolGroupId[key])
          .find((value) => value === typeKeyword);
      }
    }
  }

}

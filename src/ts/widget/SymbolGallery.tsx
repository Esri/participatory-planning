import { declared, property, subclass } from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import EsriSymbol from "esri/symbols/Symbol";
import { renderable, tsx } from "esri/widgets/support/widget";

import Scene from "../Scene";
import DrawWidget from "./DrawWidget";
import SymbolGroup from "./symbols/SymbolGroup";
import SymbolItem from "./symbols/SymbolItem";

// esri
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
    this.load();
  }

  public render() {
    const selectedGroup = this.selectedGroup;
    const galleryItems = selectedGroup ? selectedGroup.items.toArray() : [];
    const galleryGridClass = galleryItems.length ? ["gallery-grid"] : ["hide"];
    return (
      <div>
        <div class={ galleryGridClass.join(" ") }>
        {
          galleryItems.map((item) => this.renderSymbolItem(item))
        }
        </div>
      </div>
    );
  }

  private renderSymbolItem(item: SymbolItem) {
    const href = item.thumbnailHref;
    const key = item.group.category + item.name;

    return (
      <div class="gallery-grid-item" key={key} bind={this} onclick={ this.selectSymbolItem } data-item={item}>
        <img src={href} />
      </div>
    );
    // draggable="true" bind={this} ondragstart={ this.startDrag }
  }

  private selectSymbolItem(event: any) {
    const selectedSymbol = event.currentTarget["data-item"] as SymbolItem;
    if (selectedSymbol) {
      this.selectedGroupId = null;
      selectedSymbol.fetchSymbol().then((symbol) => {
        this.placeSymbol(symbol);
      });
    }
  }

  private placeSymbol(symbol: EsriSymbol) {
    this.createPointGraphic(symbol).then((graphic) => {
      this.placeSymbol(graphic.symbol);
    });
  }

  private load(): IPromise {
    if (!this.loadingPromise) {
      this.loadingPromise = this
        .loadPortal()
        .then((portal) => this.querySymbolGroups(portal))
        .then((symbolGroups) => {
          this.groups = new Collection<SymbolGroup>(symbolGroups);
          this.groups.forEach((group) => group.loadItems());
        });
        // .then(() => this.scheduleRender());
    }

    return this.loadingPromise;
  }

  private loadPortal(): IPromise<Portal> {
    const portal = this.portal || Portal.getDefault();

    return portal.load().then(() => {
      this.portal = portal;
      return portal;
    });
  }

  private querySymbolGroups(portal: Portal): IPromise<SymbolGroup[]> {
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
        .map((item) => this.groupFromItem(item))
        .filter((item) => item != null) as SymbolGroup[];
    });
  }

  private groupFromItem(item: PortalItem): SymbolGroup | null {
    const groupId = this.groupIdFromItem(item);
    return groupId ? new SymbolGroup(groupId, item) : null;
  }

  private groupIdFromItem(item: PortalItem): SymbolGroupId | undefined {
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

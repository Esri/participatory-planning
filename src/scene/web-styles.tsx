import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams";
import PortalQueryResult from "@arcgis/core/portal/PortalQueryResult";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import { queryOptions } from "@tanstack/react-query";

export const webStyleGroupListQueryOptions = (portal = Portal.getDefault()) => queryOptions({
  queryKey: [portal.url, 'webstyles', 'group', 'list'],
  queryFn: async () => {
    const groups = await portal.queryGroups({
      query: "title:\"Esri Styles\" AND owner:esri_en",
    })

    const queryParams = new PortalQueryParams({
      num: 20,
      sortField: "title",
    });

    const results: PortalQueryResult = await groups.results[0].queryItems(queryParams);

    return results.results as PortalItem[];
  }
});

export const webStyleGroupItemsQueryOptions = (portalItem: PortalItem) => queryOptions({
  queryKey: [portalItem.portal.url, 'webstyles', 'group', portalItem.id, 'items'],
  queryFn: async ({ signal }) => {
    const data = await portalItem.fetchData("json", { signal });
    return data.items;
  },
  select: (items): WebStyleSymbolItem[] => {
    return items.map((item: any) => ({
      webSymbol: new WebStyleSymbol({
        name: item.name,
        styleName: getStyleName(portalItem),
      }),
      thumbnail: item.thumbnail.href as string,
    }))
  }
});

export function getStyleName(item: PortalItem): string {
  for (const typeKeyword of item.typeKeywords) {
    if (/^Esri.*Style$/.test(typeKeyword) && typeKeyword !== "Esri Style") {
      return typeKeyword;
    }
  }
  return "";
}

export function styleNameMatchesGroup(category: "icons" | "trees" | "vehicles", styleName: string): boolean {
  switch (category) {
    case "icons":
      return styleName === "EsriIconsStyle";
    case "trees":
      return styleName === "EsriRealisticTreesStyle";
    case "vehicles":
      return styleName === "EsriRealisticTransportationStyle";
  }
}

export type WebStyleSymbolItem = { webSymbol: WebStyleSymbol; thumbnail: string }
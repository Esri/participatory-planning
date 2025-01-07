/* Copyright 2024 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams";
import PortalQueryResult from "@arcgis/core/portal/PortalQueryResult";
import Symbol from "@arcgis/core/symbols/Symbol";
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
  },
  staleTime: Infinity
});

export const webStyleGroupItemsQueryOptions = (portalItem: PortalItem) => queryOptions({
  queryKey: [portalItem.portal.url, 'webstyles', 'group', portalItem.id, 'items'],
  queryFn: async ({ signal }) => {
    const data = await portalItem.fetchData("json", { signal });
    const items = data.items;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webStyles: WebStyleSymbol[] = items.map((item: any) => new WebStyleSymbol({
      name: item.name,
      styleName: getStyleName(portalItem),
    }));

    const symbols = await Promise.all(webStyles.map(style => style.fetchSymbol()));

    return webStyles.map((style, index) => ({
      webSymbol: style,
      symbol: symbols[index],
      thumbnail: items[index].thumbnail.href as string
    }));
  },
  staleTime: Infinity
});

export function getStyleName(item: PortalItem): string {
  for (const typeKeyword of item.typeKeywords) {
    if (/^Esri.*Style$/.test(typeKeyword) && typeKeyword !== "Esri Style") {
      return typeKeyword;
    }
  }
  return "";
}

export function styleNameMatchesGroup(category: string, styleName: string): boolean {
  switch (category) {
    case "icons":
      return styleName === "EsriIconsStyle";
    case "trees":
      return styleName === "EsriRealisticTreesStyle";
    case "vehicles":
      return styleName === "EsriRealisticTransportationStyle";
    default:
      return false;
  }
}

export type WebStyleSymbolItem = { webSymbol: WebStyleSymbol; symbol: Symbol; thumbnail: string }
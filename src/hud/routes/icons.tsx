import { useSuspenseQuery, useSuspenseQueries, useQueryClient, useQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { webStyleGroupListQueryOptions, styleNameMatchesGroup, getStyleName, webStyleGroupItemsQueryOptions, WebStyleSymbolItem } from "../../scene/web-styles";
import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";
import { useDrawingTool } from "../../drawing/drawing-tool";
import { tools } from "../tool-config";

export function Icons() {
  return (
    <HUDSubGrid>
      <Suspense fallback={<div>loading...</div>}>
        <IconItems />
      </Suspense>
    </HUDSubGrid>
  )
}

function IconItems() {
  const { data } = useSuspenseQuery(webStyleGroupListQueryOptions())

  const icons = data.filter(item => styleNameMatchesGroup("icons", getStyleName(item)))
  const itemsQueries = useSuspenseQueries({
    queries: icons.map(item => webStyleGroupItemsQueryOptions(item)),
  })

  const items = itemsQueries.flatMap(item => item.data);

  return items.map((item) => (<IconItem key={item.webSymbol.name} item={item} />));
}

function IconItem(props: { item: WebStyleSymbolItem }) {
  const tool = useDrawingTool(props.item.symbol, tools.icons.name);

  return (
    <HUDGridButton onPress={create}>
      <img src={props.item.thumbnail} />
    </HUDGridButton>
  )

  async function create() {
    await tool.create();
    create();
  }
}


export function PrefetchIcons() {
  const { data } = useQuery(webStyleGroupListQueryOptions())

  const iconGroup = data?.filter(item => styleNameMatchesGroup("icons", getStyleName(item)))

  const queryClient = useQueryClient();
  useEffect(() => {
    for (const icon of iconGroup ?? []) {
      queryClient.prefetchQuery(webStyleGroupItemsQueryOptions(icon));
    }
  }, [iconGroup, queryClient])

  return null;
}
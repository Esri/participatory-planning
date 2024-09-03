import { Suspense, useEffect } from "react";
import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";
import { useQuery, useQueryClient, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getStyleName, styleNameMatchesGroup, webStyleGroupItemsQueryOptions, webStyleGroupListQueryOptions, WebStyleSymbolItem } from "../../scene/web-styles";


export function Trees() {
  return (
    <HUDSubGrid>
      <Suspense fallback={<div>loading...</div>}>
        <TreeItems />
      </Suspense>
    </HUDSubGrid>
  )
}

function TreeItems() {
  const { data } = useSuspenseQuery(webStyleGroupListQueryOptions())

  const trees = data.filter(item => styleNameMatchesGroup("trees", getStyleName(item)))
  const itemsQueries = useSuspenseQueries({
    queries: trees.map(item => webStyleGroupItemsQueryOptions(item)),
  })

  const items = itemsQueries.flatMap(item => item.data);

  return items.map((item) => (
    <TreeItem key={item.webSymbol.name} item={item} />
  ));
}

function TreeItem(props: { item: WebStyleSymbolItem }) {
  return (
    <HUDGridButton>
      <img src={props.item.thumbnail} />
    </HUDGridButton>
  )
}

export function PrefetchTrees() {
  const { data } = useQuery(webStyleGroupListQueryOptions())

  const iconGroup = data?.filter(item => styleNameMatchesGroup("trees", getStyleName(item)))

  const queryClient = useQueryClient();
  useEffect(() => {
    for (const icon of iconGroup ?? []) {
      queryClient.prefetchQuery(webStyleGroupItemsQueryOptions(icon));
    }
  }, [iconGroup, queryClient])

  return null;
}
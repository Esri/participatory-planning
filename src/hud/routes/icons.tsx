import { useSuspenseQuery, useSuspenseQueries, useQueryClient, useQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { webStyleGroupListQueryOptions, styleNameMatchesGroup, getStyleName, webStyleGroupItemsQueryOptions } from "../../scene/web-styles";
import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";

export function Icons() {
  return (
    <HUDSubGrid>
      <Suspense fallback={<div>loading...</div>}>
        <IconItem />
      </Suspense>
    </HUDSubGrid>
  )
}

function IconItem() {
  const { data } = useSuspenseQuery(webStyleGroupListQueryOptions())

  const icons = data.filter(item => styleNameMatchesGroup("icons", getStyleName(item)))
  const itemsQueries = useSuspenseQueries({
    queries: icons.map(item => webStyleGroupItemsQueryOptions(item)),
  })

  const items = itemsQueries.flatMap(item => item.data);

  return items.map((item) => (
    <HUDGridButton key={item.webSymbol.name}>
      <img src={item.thumbnail} />
    </HUDGridButton>
  ));
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
import { useSuspenseQuery, useSuspenseQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { webStyleGroupListQueryOptions, styleNameMatchesGroup, getStyleName, webStyleGroupItemsQueryOptions } from "../../scene/web-styles";
import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";

export function Vehicles() {
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

  const vehicles = data.filter(item => styleNameMatchesGroup("vehicles", getStyleName(item)))
  const itemsQueries = useSuspenseQueries({
    queries: vehicles.map(item => webStyleGroupItemsQueryOptions(item)),
  })

  const items = itemsQueries.flatMap(item => item.data);

  return items.map((item) => (
    <HUDGridButton key={item.webSymbol.name}>
      <img src={item.thumbnail} />
    </HUDGridButton>
  ));
}


export function PrefetchVehicles() {
  const { data } = useQuery(webStyleGroupListQueryOptions())

  const iconGroup = data?.filter(item => styleNameMatchesGroup("vehicles", getStyleName(item)))

  const queryClient = useQueryClient();
  useEffect(() => {
    for (const icon of iconGroup ?? []) {
      queryClient.prefetchQuery(webStyleGroupItemsQueryOptions(icon));
    }
  }, [iconGroup, queryClient])

  return null;
}
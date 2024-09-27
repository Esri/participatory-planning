import { useSuspenseQuery, useSuspenseQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { webStyleGroupListQueryOptions, styleNameMatchesGroup, getStyleName, webStyleGroupItemsQueryOptions, WebStyleSymbolItem } from "../../scene/web-styles";
import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";
import { useDrawingTool } from "../../drawing/drawing-tool";
import { tools } from "../tool-config";

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

  return items.map((item) => <VehicleItem key={item.webSymbol.name} item={item} />);
}

function VehicleItem(props: { item: WebStyleSymbolItem }) {
  const tool = useDrawingTool(props.item.symbol, tools.vehicles.name);

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
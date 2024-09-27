import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import { useDrawingTool } from "../../drawing/drawing-tool";
import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";
import { useMemo } from "react";
import { tools } from "../tool-config";

export function Buildings() {
  return (
    <HUDSubBar>
      <BuildingTool floors={3} color="#ffffff" label="3-Story Building" />
      <BuildingTool floors={5} color="#ffffff" label="5-Story Building" />
      <BuildingTool floors={10} color="#ffffff" label="10-Story Building" />
    </HUDSubBar>
  )
}

const BUILDING_FLOOR_HEIGHT = 3;

function BuildingTool(props: {
  floors?: number;
  color?: string;
  label: string;
}) {
  const {
    floors = 1,
    color = '#ffffff'
  } = props;

  const symbol = useMemo(() => new PolygonSymbol3D({
    symbolLayers: [{
      type: "extrude",
      material: {
        color,
      },
      edges: {
        type: "solid",
        color: [100, 100, 100],
      },
      size: floors * BUILDING_FLOOR_HEIGHT,
    }],
  }), [color, floors])

  const tool = useDrawingTool(symbol, tools.buildings.name)

  return (
    <HUDButton onPress={() => tool.create()}>{props.label}</HUDButton>
  )
}
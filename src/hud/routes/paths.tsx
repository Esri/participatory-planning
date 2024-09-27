import { useMemo } from "react";
import { useDrawingTool } from "../../drawing/drawing-tool";
import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import { tools } from "../tool-config";

export function Paths() {
  return (
    <HUDSubBar>
      <PathTool color="#cbcbcb" width={20} label="Create street" />
      <PathTool color="#b2b2b2" width={3} label="Create walking path" />
    </HUDSubBar>
  )
}


function PathTool(props: {
  color?: string;
  width?: number;
  label: string;
}) {
  const {
    color = '#ffffff',
    width = 1,
  } = props;

  const symbol = useMemo(() => new SimpleLineSymbol({
    color,
    width
  }), [color, width])

  const tool = useDrawingTool(symbol, tools.paths.name)

  return (
    <HUDButton onPress={() => tool.create()}>{props.label}</HUDButton>
  )
}
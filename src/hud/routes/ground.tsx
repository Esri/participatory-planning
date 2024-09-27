import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";
import { useMemo } from "react";
import { useDrawingTool } from "../../drawing/drawing-tool";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { tools } from "../tool-config";

export function Ground() {
  return (
    <HUDSubBar>
      <GroundTool color="#f0f0f0" label="Create Ground" />
      <GroundTool color="#bdce8a" label="Create Lawn" />
      <GroundTool color="#dfca8f" label="Create Beach" />
      <GroundTool color="#a0b4cf" label="Create Water" />
    </HUDSubBar>
  )
}

function GroundTool(props: {
  color?: string;
  label: string;
}) {
  const {
    color = '#ffffff'
  } = props;

  const symbol = useMemo(() => new SimpleFillSymbol({
    color,
    outline: {
      width: 0
    }
  }), [color])

  const tool = useDrawingTool(symbol, tools.ground.name)

  return (
    <HUDButton onPress={() => tool.create()}>{props.label}</HUDButton>
  )
}
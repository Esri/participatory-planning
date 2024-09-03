import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";

export function Paths() {

  return (
    <HUDSubBar>
      <HUDButton>Create street</HUDButton>
      <HUDButton>Create walking path</HUDButton>
    </HUDSubBar>
  )
}
import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";

export function Buildings() {

  return (
    <HUDSubBar>
      <HUDButton>3-Story Building</HUDButton>
      <HUDButton>5-Story Building</HUDButton>
      <HUDButton>10-Story Building</HUDButton>
    </HUDSubBar>
  )
}
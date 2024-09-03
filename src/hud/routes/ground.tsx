import { HUDButton } from "../hud-button";
import { HUDSubBar } from "../hud-sub-bar";

export function Ground() {

  return (
    <HUDSubBar>
      <HUDButton>Create Ground</HUDButton>
      <HUDButton>Create Lawn</HUDButton>
      <HUDButton>Create Beach</HUDButton>
      <HUDButton>Create Water</HUDButton>
    </HUDSubBar>
  )
}
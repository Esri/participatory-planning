import { HUDGridButton } from "../hud-button";
import { HUDSubGrid } from "../hud-sub-grid";

const boxes = Array.from({ length: 80 }).map(() => <HUDGridButton />)

export function Vehicles() {
  return (
    <HUDSubGrid>
      {boxes}
    </HUDSubGrid>
  )
}
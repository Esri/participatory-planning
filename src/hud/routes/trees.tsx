import { HudSubGrid } from "../hud-sub-grid";

const boxes = Array.from({ length: 80 }).map(() => <div className="h-[70px] w-[70px] rounded-md bg-blue-500" />)

export function Trees() {
  return (
    <HudSubGrid>
      {boxes}
    </HudSubGrid>
  )
}
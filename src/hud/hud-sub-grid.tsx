import { PropsWithChildren } from "react";

export function HudSubGrid(props: PropsWithChildren) {

  return (
    <div className="p-4 rounded-lg grow-0 flex flex-wrap justify-center gap-2">
      {props.children}
    </div>
  )
}
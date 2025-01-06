import { PropsWithChildren } from "react";

export function HudSubBar(props: PropsWithChildren) {

  return (
    <div className="p-4 bg-blue-500 rounded-lg grow-0 flex gap-6">
      {props.children}
    </div>
  )
}
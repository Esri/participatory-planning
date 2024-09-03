import { PropsWithChildren } from "react";

export function HUDSubBar(props: PropsWithChildren) {

  return (
    <div className="p-4 bg-white/40 rounded-lg grow-0 flex gap-6 pointer-events-auto">
      {props.children}
    </div>
  )
}
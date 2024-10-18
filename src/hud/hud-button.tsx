import { forwardRef, PropsWithChildren } from "react";
import { Button, ButtonProps } from "react-aria-components";

export function HUDButton(props: ButtonProps) {
  return (
    <Button {...props} className={
      "flex justify-center items-center whitespace-nowrap rounded-lg p-2 -m-2 self-center aria-[current=page]:bg-white/30 hover:bg-white/20 focus-visible:bg-white/20 " + props.className
    } />
  )
}

export function HUDEndButton(props: ButtonProps) {
  return (
    <HUDButton {...props} className={"flex-grow uppercase " + props.className} />
  )
}

export const ToolkitButton = forwardRef<HTMLButtonElement, PropsWithChildren<{ onPress: () => void; isActive: boolean }>>((props, ref) => {
  return (
    <Button
      ref={ref}
      onPress={props.onPress}
      data-selected={props.isActive}
      className={
        "flex justify-center items-center whitespace-nowrap rounded-lg p-2 -m-2 aspect-square h-[65px] self-center hover:bg-white/20 focus-visible:bg-white/20 hudlink flex-col data-[selected=true]:text-sky-700 data-[selected=true]:bg-white/30"
      }
    >
      {props.children}
    </Button>
  )
})

export function ToolbarButton(props: PropsWithChildren<{ isActive: boolean; onPress: () => void; }>) {
  return (
    <Button
      onPress={props.onPress}
      data-selected={props.isActive}
      className={
        "flex justify-center items-center whitespace-nowrap rounded-lg p-2 -m-2 self-center hover:bg-white/20 focus-visible:bg-white/20 data-[selected=true]:bg-white/30 data-[selected=true]:text-sky-700"
      }
    >
      {props.children}
    </Button>
  )
}

export function GridButton(props: PropsWithChildren<{ isActive: boolean; onPress: () => void; }>) {
  return (
    <Button
      onPress={props.onPress}
      data-selected={props.isActive}
      className="flex p-2 -m-2 h-[65px] aspect-square rounded-md bg-white/20 hover:bg-white/50 focus-visible:bg-white/50 data-[selected=true]:bg-white/30 data-[selected=true]:text-sky-700"
    >
      {props.children}
    </Button>
  )
}
import { forwardRef } from "react";
import { Button, ButtonProps } from "react-aria-components";

export const HUDLink = forwardRef<HTMLButtonElement, ButtonProps>(function HUDLink(props, ref) {
  return (
    <Button
      ref={ref}
      {...props}
      className={
        "flex justify-center items-center whitespace-nowrap rounded-lg p-2 -m-2 aspect-square h-[65px] self-center hover:bg-white/20 focus-visible:bg-white/20 aria-[current=page]:bg-white/30 aria-[current=page]:text-sky-700 "
        + props.className
      }
    />
  )
})

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

export function HUDGridButton(props: ButtonProps) {
  return (
    <HUDButton {...props} className={"h-[65px] aspect-square rounded-md bg-white/20 hover:bg-white/50 focus-visible:bg-white/50 " + props.className} />
  )
}
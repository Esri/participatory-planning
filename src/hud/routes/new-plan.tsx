import { Button, Heading } from "react-aria-components"
import { HUDModal } from "../hud-modal";
import { useMatch } from "react-router-dom";
import { HUDEndButton } from "../hud-button";
import { PropsWithChildren } from "react";

export function NewPlan() {
  const isOnNew = useMatch("/") != null;
  return (
    <HUDModal
      defaultOpen={isOnNew}
      trigger={
        <HUDEndButton>
          New plan
        </HUDEndButton>
      }
    >
      {({ close }) => (
        <div className="flex gap-6">
          <figure className="flex-none w-48 relative -my-6 -ms-6 flex items-end">
            <img className="absolute inset-0 w-full h-full object-cover" src="https://www.arcgis.com/sharing/rest/content/items/bceae470c9a04e5bb3ad42323c726c97/info/thumbnail/thumbnail1556108667093.png?f=json&w=400" />
            <figcaption className="bg-white/60 py-2 px-4 w-full backdrop-blur-lg text-sm">Dumbo, Brooklyn NY</figcaption>
          </figure>
          <div className="flex flex-col gap-4">
            <Heading slot="title" className="text-xl">Participatory planning</Heading>
            <ul className="list-disc ps-8 flex flex-col gap-1">
              <li>When creating shapes, either double click or press <Pre>C</Pre> to complete.</li>
              <li>Press <Pre>Del</Pre> or <Pre>Backspace</Pre> to remove a selected object.</li>
              <li>Press <Pre>Escape</Pre> to revert a current editing.</li>
            </ul>
            <div className="flex gap-4">
              <Button onPress={close} className="p-2 bg-sky-600 text-white rounded-lg">
                Start planning
              </Button>
              <Button onPress={close} className="p-2 text-sky-600">
                Skip animation
              </Button>
            </div>
          </div>
        </div>
      )}
    </HUDModal>
  )
}

function Pre({ children }: PropsWithChildren) {

  return (
    <code className="inline bg-slate-200/50 outline outline-1 outline-slate-300/80 rounded-sm p-[2px] -my-[2px] -mx-[1px]">{children}</code>
  )
}